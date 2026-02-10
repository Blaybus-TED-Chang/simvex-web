'use client';

import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useState, useRef, useCallback, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { combinedModels, getCombinedModelById, getModelById } from '@/data/models';
import { suspensionModel } from '@/data/models/suspension';
import { hasSimulation } from '@/data/simulationMapping';
import { createClient } from '@/lib/supabase/client';
import { useViewerStore } from '@/lib/store/viewerStore';
import { useUser } from '@/hooks/useUser';
import { useUserModels, getPublicUrl } from '@/hooks/useUserModels';
import { useScraps } from '@/hooks/useScraps';
import type { UserModelRow } from '@/types/userModel';
import { LoginModal } from '@/components/auth/LoginModal';

/* ── 썸네일 슬라이드쇼 ── */
function ThumbnailSlideshow({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<NodeJS.Timeout | null>(null);
  const start = useCallback(() => {
    if (images.length <= 1) return;
    ref.current = setInterval(() => setIdx((p) => (p + 1) % images.length), 1200);
  }, [images.length]);
  const stop = useCallback(() => {
    if (ref.current) { clearInterval(ref.current); ref.current = null; }
    setIdx(0);
  }, []);
  useEffect(() => () => { if (ref.current) clearInterval(ref.current); }, []);

  return (
    <div className="relative w-full h-full overflow-hidden" onMouseEnter={start} onMouseLeave={stop}>
      {images.map((src, i) => (
        <Image key={src} src={src} alt={`thumbnail ${i + 1}`} fill
          className={`object-cover transition-opacity duration-500 ${i === idx ? 'opacity-100' : 'opacity-0'}`}
          sizes="360px" />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === idx ? 'bg-white scale-110' : 'bg-white/30'
            }`} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 사이드바 네비게이션 ── */
const NAV_ITEMS = [
  { label: '홈', href: '/models', requireAuth: false },
  { label: '나의 워크플레이스', href: '#workspace', requireAuth: true },
  { label: 'World', href: '/community', requireAuth: false },
  { label: '설정', href: '#', requireAuth: false },
  { label: 'FAQ', href: '#faq', requireAuth: false },
  { label: '공지사항', href: '#notice', requireAuth: false },
];

/* ── FAQ 데이터 ── */
const FAQ_DATA = [
  {
    q: 'SIMVEX는 어떤 서비스인가요?',
    a: 'SIMVEX는 3D 기계 부품 모델을 웹에서 조립·분해하며 학습할 수 있는 공학 교육 플랫폼입니다. 드론, 로봇팔, 서스펜션 등 다양한 모델을 직접 회전·확대하며 구조를 파악할 수 있습니다.',
  },
  {
    q: '3D 모델을 직접 업로드할 수 있나요?',
    a: 'GLB 또는 FBX 형식의 3D 파일을 업로드하면, 자동으로 부품이 감지되고 분해 설정이 생성됩니다. 업로드 후 부품 이름, 색상, 분해 방향 등을 자유롭게 편집할 수 있습니다.',
  },
  {
    q: 'AI 어시스턴트는 어떤 도움을 주나요?',
    a: '뷰어에서 부품을 선택하면 AI가 해당 부품의 역할, 재질, 작동 원리 등을 실시간으로 설명해줍니다. 추가 질문도 자유롭게 할 수 있어 궁금한 점을 바로 해결할 수 있습니다.',
  },
  {
    q: '무료로 사용할 수 있나요?',
    a: '기본 3D 뷰어와 내장 모델 학습은 무료로 제공됩니다. 모델 업로드, AI 어시스턴트 등 고급 기능은 회원가입 후 이용하실 수 있습니다.',
  },
  {
    q: '어떤 기기에서 사용할 수 있나요?',
    a: 'SIMVEX는 웹 기반 서비스로, Chrome·Edge·Safari 등 최신 브라우저가 설치된 PC·태블릿에서 별도 설치 없이 바로 사용할 수 있습니다.',
  },
  {
    q: '분해도 슬라이더는 어떻게 사용하나요?',
    a: '뷰어 화면 하단의 슬라이더를 드래그하면 0%(완제품)에서 100%(완전 분해)까지 부품을 실시간으로 분리하거나 조립할 수 있습니다. 각 부품이 어디에 위치하는지 직관적으로 확인할 수 있습니다.',
  },
];

/* ── FAQ 모달 ── */
function FaqModal({ onClose }: { onClose: () => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: 'fadeIn 0.25s ease both' }}
    >
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* 모달 */}
      <div
        className="relative w-full max-w-[580px] mx-4 max-h-[82vh] flex flex-col rounded-[20px] overflow-hidden bg-white"
        style={{
          animation: 'scaleIn 0.3s ease both',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* 상단 헤더 */}
        <div className="relative shrink-0 px-7 pt-7 pb-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm">
              <svg className="w-[22px] h-[22px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>자주 묻는 질문</h2>
              <p className="text-[13px] text-gray-400 mt-0.5" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>SIMVEX 이용 가이드</p>
            </div>
          </div>

          {/* 구분선 */}
          <div className="mt-5 border-b border-gray-100" />
        </div>

        {/* FAQ 목록 */}
        <div className="flex-1 overflow-y-auto px-7 pb-6" style={{ scrollbarWidth: 'thin' }}>
          <div className="flex flex-col gap-2.5">
            {FAQ_DATA.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`faq-item${isOpen ? ' faq-open' : ''}`}
                  style={{ animation: `fadeInUp 0.3s ease ${idx * 0.05}s both` }}
                >
                  <button
                    className="faq-question"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-[13px] font-bold shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`text-[14.5px] font-semibold transition-colors duration-300 ${
                        isOpen ? 'text-gray-900' : 'text-gray-700'
                      }`} style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
                        {item.q}
                      </span>
                    </div>
                    <div className="faq-chevron">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke={isOpen ? '#374151' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>
                  <div className={`faq-answer${isOpen ? ' faq-answer-open' : ''}`}>
                    <div className="px-6 pb-5 pl-[60px]" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
                      <p className="text-[13.5px] text-gray-500 leading-[22px]">{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 */}
        <div className="shrink-0 px-7 py-4 border-t border-gray-50 bg-[#FAFBFC]">
          <p className="text-[12px] text-gray-400 text-center" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
            더 궁금한 점이 있다면 뷰어의 <span className="text-gray-600 font-medium">AI 어시스턴트</span>를 이용해보세요
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── 공지사항 데이터 ── */
const NOTICE_DATA: { tag: string; tagColor: string; title: string; date: string; body: string; pinned?: boolean }[] = [
  {
    tag: '서비스',
    tagColor: '#E0E7FF',
    title: 'SIMVEX 오픈 베타 출시 안내',
    date: '2026.02.10',
    body: '안녕하세요, SIMVEX 팀입니다. 오늘부터 SIMVEX 오픈 베타 서비스를 시작합니다. 3D 모델 뷰어, 분해도 학습, AI 어시스턴트 등 핵심 기능을 자유롭게 이용해보세요. 베타 기간 동안 발견되는 버그나 개선 의견은 언제든 환영합니다.',
    pinned: true,
  },
  {
    tag: '업데이트',
    tagColor: '#D1FAE5',
    title: '사용자 모델 업로드 기능 추가',
    date: '2026.02.08',
    body: 'GLB·FBX 형식의 3D 모델을 직접 업로드하고, 자동 분해 설정과 함께 뷰어에서 확인할 수 있는 기능이 추가되었습니다. 부품 이름·색상·분해 방향 편집과 커뮤니티 공개 옵션도 지원됩니다.',
  },
  {
    tag: '업데이트',
    tagColor: '#D1FAE5',
    title: 'AI 어시스턴트 응답 품질 개선',
    date: '2026.02.06',
    body: 'AI 어시스턴트가 GPT-5-mini 기반으로 업그레이드되어 부품 설명의 정확도와 한국어 응답 품질이 크게 향상되었습니다. 뷰어에서 부품을 선택한 상태로 질문하면 더 정확한 답변을 받을 수 있습니다.',
  },
  {
    tag: '안내',
    tagColor: '#FEF3C7',
    title: '지원 파일 형식 및 용량 안내',
    date: '2026.02.05',
    body: '현재 업로드 가능한 파일 형식은 GLB와 FBX이며, 최대 파일 크기는 50MB입니다. OBJ 등 추가 형식 지원은 향후 업데이트를 통해 제공될 예정입니다.',
  },
  {
    tag: '서비스',
    tagColor: '#E0E7FF',
    title: '커뮤니티 모델 공유 기능 오픈',
    date: '2026.02.03',
    body: '업로드한 3D 모델을 다른 사용자들과 공유할 수 있는 커뮤니티 기능이 오픈되었습니다. 모델 관리 페이지에서 공개 설정을 켜면 커뮤니티 모델 목록에 노출됩니다.',
  },
  {
    tag: '점검',
    tagColor: '#FEE2E2',
    title: '2/1(토) 서버 정기 점검 안내',
    date: '2026.01.30',
    body: '2월 1일(토) 02:00~04:00 (약 2시간) 동안 서버 정기 점검이 진행됩니다. 점검 중에는 서비스 이용이 제한될 수 있으니 양해 부탁드립니다.',
  },
];

/* ── 공지사항 모달 ── */
function NoticeModal({ onClose }: { onClose: () => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ animation: 'fadeIn 0.25s ease both' }}
    >
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

      <div
        className="relative w-full max-w-[620px] mx-4 max-h-[85vh] flex flex-col rounded-[20px] overflow-hidden bg-white"
        style={{
          animation: 'scaleIn 0.3s ease both',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* 헤더 */}
        <div className="relative shrink-0 px-7 pt-7 pb-5">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-sm">
              <svg className="w-[22px] h-[22px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>공지사항</h2>
              <p className="text-[13px] text-gray-400 mt-0.5" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>SIMVEX 소식과 업데이트</p>
            </div>
          </div>

          <div className="mt-5 border-b border-gray-100" />
        </div>

        {/* 공지 목록 */}
        <div className="flex-1 overflow-y-auto px-7 pb-6" style={{ scrollbarWidth: 'thin' }}>
          <div className="flex flex-col gap-2">
            {NOTICE_DATA.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    animation: `fadeInUp 0.3s ease ${idx * 0.05}s both`,
                    background: isOpen ? '#fff' : '#FAFBFC',
                    border: isOpen ? '1px solid #D4D9E4' : '1px solid #F0F0F0',
                    boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  <button
                    className="w-full flex items-start gap-3 px-5 py-4 text-left"
                    style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                  >
                    {/* 핀 또는 번호 */}
                    <div className={`shrink-0 w-6 h-6 mt-0.5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300 ${
                      item.pinned
                        ? 'bg-gray-800 text-white'
                        : isOpen ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {item.pinned ? (
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M5 5a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V5zm0 8a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H6z" />
                        </svg>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* 태그 + 날짜 */}
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold"
                          style={{
                            background: item.tagColor,
                            color: item.tag === '점검' ? '#991B1B' : item.tag === '안내' ? '#92400E' : item.tag === '업데이트' ? '#065F46' : '#3730A3',
                          }}
                        >
                          {item.tag}
                        </span>
                        <span className="text-[11.5px] text-gray-400">{item.date}</span>
                      </div>

                      {/* 제목 */}
                      <p className={`text-[14px] font-semibold leading-snug transition-colors duration-300 ${
                        isOpen ? 'text-gray-900' : 'text-gray-700'
                      }`} style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
                        {item.title}
                      </p>
                    </div>

                    {/* 셰브론 */}
                    <div className="shrink-0 mt-1 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke={isOpen ? '#374151' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </button>

                  {/* 본문 */}
                  <div
                    className="overflow-hidden transition-all duration-400"
                    style={{
                      maxHeight: isOpen ? 200 : 0,
                      opacity: isOpen ? 1 : 0,
                      transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
                    }}
                  >
                    <div className="px-5 pb-5 pl-[52px]">
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-[13px] text-gray-500 leading-[22px] mt-3" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
                          {item.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 */}
        <div className="shrink-0 px-7 py-4 border-t border-gray-50 bg-[#FAFBFC]">
          <p className="text-[12px] text-gray-400 text-center" style={{ fontFamily: "'Pretendard Variable', sans-serif" }}>
            SIMVEX 팀은 더 나은 학습 경험을 위해 노력합니다
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── 공개/비공개/공유 상태 드롭다운 ── */
type VisibilityState = 'private' | 'shared' | 'public';

const VISIBILITY_OPTIONS: { key: VisibilityState; label: string; desc: string }[] = [
  { key: 'public',  label: '전체공개', desc: 'World 게시, 누구나 열람·다운' },
  { key: 'shared',  label: '일부공개', desc: '링크가 있으면 열람·다운 가능' },
  { key: 'private', label: '비공개',   desc: '나만 볼 수 있음' },
];

function VisibilityIcon({ state }: { state: VisibilityState }) {
  if (state === 'public') return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
  if (state === 'shared') return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

const VIS_COLORS: Record<VisibilityState, string> = {
  private: 'text-gray-400',
  shared:  'text-blue-400',
  public:  'text-green-400',
};

function VisibilityDropdown({
  state,
  onChange,
}: {
  state: VisibilityState;
  onChange?: (next: VisibilityState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(state);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // 부모 state가 바뀌면 로컬도 동기화
  useEffect(() => { setLocal(state); }, [state]);

  useEffect(() => {
    if (!open) return;
    const updatePos = () => {
      if (!btnRef.current) return;
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left + r.width / 2 });
    };
    updatePos();
    const handler = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      const portal = document.getElementById('vis-dropdown-portal');
      if (portal?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', updatePos, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', updatePos, true);
    };
  }, [open]);

  const bg = local === 'public' ? 'bg-green-500/80' : local === 'shared' ? 'bg-blue-500/80' : 'bg-gray-500/80';

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className={`w-8 h-8 rounded-full ${bg} backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer`}
        title={VISIBILITY_OPTIONS.find((o) => o.key === local)?.label}
      >
        <span className="text-white"><VisibilityIcon state={local} /></span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          id="vis-dropdown-portal"
          className="fixed flex gap-1.5 p-1.5 rounded-full bg-white shadow-xl border border-gray-200"
          style={{ top: pos.top, left: pos.left, transform: 'translateX(-50%)', zIndex: 9999 }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {VISIBILITY_OPTIONS.map((opt) => {
            const active = local === opt.key;
            const optBg = opt.key === 'public' ? 'bg-green-500' : opt.key === 'shared' ? 'bg-blue-500' : 'bg-gray-500';
            return (
              <button
                key={opt.key}
                onClick={() => {
                  setLocal(opt.key);   // 즉시 아이콘 변경
                  onChange?.(opt.key);  // DB 업데이트 (비동기)
                  setOpen(false);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 ${
                  active
                    ? `${optBg} text-white ring-2 ring-offset-1 ring-blue-300`
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
                title={`${opt.label}: ${opt.desc}`}
              >
                <VisibilityIcon state={opt.key} />
              </button>
            );
          })}
        </div>,
        document.body,
      )}
    </>
  );
}

/* ── 모델 카드 ── */
function ModelCard({ model, delay }: {
  model: { id: string; href: string; name: string; nameKo: string; description: string; category: string; partsCount: number; thumbnails?: string[]; hasSim: boolean };
  delay: number;
}) {
  return (
    <Link href={model.href} className="group models-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="models-card-inner rounded-2xl overflow-hidden bg-white border border-gray-200">
        <div className="relative h-[200px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
          {model.thumbnails && model.thumbnails.length > 0 ? (
            <ThumbnailSlideshow images={model.thumbnails} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
              </svg>
            </div>
          )}
          <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors">
                {model.name}
              </h3>
              <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="6" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="18" r="1.5" />
            </svg>
          </div>
          <p className="text-[13px] font-semibold text-[#001AFF] mb-2">공학 &gt; {model.category}</p>
          <p className="text-[12px] text-gray-500 mb-0.5">{model.nameKo}</p>
          <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">{model.description}</p>
        </div>
      </div>
    </Link>
  );
}

export default function ModelsPage() {
  const { user } = useUser();
  const { models: myUploadedModels, fetchPublicModels, changeVisibility } = useUserModels(user);
  const { scraps, loaded: scrapsLoaded, toggleScrap } = useScraps(user);
  const [communityModels, setCommunityModels] = useState<UserModelRow[]>([]);

  // 워크플레이스 뷰 상태
  const [activeView, setActiveView] = useState<'home' | 'workspace'>('home');
  const [workspaceTab, setWorkspaceTab] = useState<'my' | 'shared' | 'bookmark'>('my');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  // 북마크 탭용 스크랩 user 모델 데이터
  const [scrapUserModels, setScrapUserModels] = useState<UserModelRow[]>([]);

  useEffect(() => { useViewerStore.persist.rehydrate(); }, []);
  useEffect(() => { fetchPublicModels(3).then(setCommunityModels); }, [fetchPublicModels]);

  // 스크랩한 user 모델 정보 조회
  const fetchScrapUserModels = useCallback(async () => {
    const userScraps = scraps.filter((s) => s.model_type === 'user');
    if (userScraps.length === 0) { setScrapUserModels([]); return; }
    const ids = userScraps.map((s) => s.model_id);
    const supabase = createClient();
    const { data } = await supabase.from('user_models').select('*').in('id', ids);
    setScrapUserModels(data ?? []);
  }, [scraps]);

  useEffect(() => { if (scrapsLoaded) fetchScrapUserModels(); }, [scrapsLoaded, fetchScrapUserModels]);

  // 스크랩 builtin 모델 정보
  const builtinScraps = scraps.filter((s) => s.model_type === 'builtin');
  const builtinScrapModels = builtinScraps.map((s) => {
    const combined = getCombinedModelById(s.model_id);
    if (combined) return { type: 'combined' as const, model: combined, scrapId: s.id };
    const regular = getModelById(s.model_id);
    if (regular) return { type: 'regular' as const, model: regular, scrapId: s.id };
    if (s.model_id === suspensionModel.id) return { type: 'regular' as const, model: suspensionModel, scrapId: s.id };
    return null;
  }).filter(Boolean) as Array<{ type: 'combined' | 'regular'; model: { id: string; name: string; nameKo: string; description: string; category: string; thumbnail?: string; thumbnails?: string[]; parts: { id: string }[] }; scrapId: string }>;

  const viewerModels = [
    ...combinedModels.map((m) => ({
      id: m.id, href: `/viewer/${m.id}`, nameKo: m.nameKo, name: m.name,
      description: m.description, category: m.category, partsCount: m.parts.length,
      thumbnails: m.thumbnails, hasSim: hasSimulation(m.id),
    })),
    {
      id: suspensionModel.id, href: `/viewer/${suspensionModel.id}`,
      nameKo: suspensionModel.nameKo, name: suspensionModel.name,
      description: suspensionModel.description, category: suspensionModel.category,
      partsCount: suspensionModel.parts.length, thumbnails: suspensionModel.thumbnails, hasSim: false,
    },
    {
      id: 'jet-engine', href: '/viewer/jet-engine?tab=sim',
      nameKo: '터보팬 엔진', name: 'Turbofan Engine Simulator',
      description: '제트 엔진의 인터랙티브 시각화와 기류 파티클, 실시간 성능 지표를 확인할 수 있습니다',
      category: '항공', partsCount: 0, thumbnails: undefined as string[] | undefined, hasSim: true,
    },
  ];

  // 검색 & 정렬
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'name' | 'oldest'>('latest');

  const recentModels = viewerModels.slice(0, 3);
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const [showLogin, setShowLogin] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const router = useRouter();
  const [loggingOut, startLogout] = useTransition();

  // 스크롤 ref
  const scrollMyRef = useRef<HTMLDivElement>(null);
  const scrollSharedRef = useRef<HTMLDivElement>(null);
  const scrollBookmarkRef = useRef<HTMLDivElement>(null);

  const scrollRight = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollBy({ left: 320, behavior: 'smooth' });
  };
  const scrollLeft = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const handleLogout = () => {
    startLogout(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
    });
  };

  useEffect(() => {
    if (user && showLogin) setShowLogin(false);
  }, [user, showLogin]);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ══════ 상단 헤더 바 ══════ */}
      <header className="flex items-center justify-between px-8 bg-white shrink-0 relative z-10" style={{ height: 72, boxShadow: '0 0 8.4px rgba(0,0,0,0.25)' }}>
        <Link href="/" className="text-[26px] text-black no-underline shrink-0" style={{ fontFamily: 'Righteous', fontWeight: 400 }}>
          SIMVEX
        </Link>

        <div className="flex items-center gap-4">
          {/* 사용자 프로필 / 로그인 */}
          {user ? (
            <Link href="/mypage" className="flex items-center gap-2.5 shrink-0 rounded-full px-2 py-1.5 -mx-2 transition-all duration-200 hover:bg-gray-100 active:scale-[0.97] cursor-pointer">
              {avatarUrl ? (
                <img src={avatarUrl} alt="프로필" className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[14px] font-bold shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[14px] font-medium text-gray-700">{displayName}</span>
            </Link>
          ) : (
            <button onClick={() => setShowLogin(true)}
              className="shrink-0 px-5 py-2 rounded-full border border-gray-200 text-[13px] font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              로그인
            </button>
          )}
        </div>
      </header>

      {/* ══════ 사이드바 + 메인 ══════ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══════ 사이드바 ══════ */}
        <aside className="models-sidebar w-[240px] flex flex-col justify-between bg-[#F8FAFF] shrink-0 border-0" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
          <div>
            <nav className="flex flex-col gap-1 px-4 pt-6">
              {NAV_ITEMS.map((item) => {
                // 비로그인 + requireAuth → 로그인 모달
                if (item.requireAuth && !user) {
                  return (
                    <button key={item.label} onClick={() => setShowLogin(true)}
                      className="models-nav-item w-full flex items-center px-4 py-3 rounded-xl text-[15px] text-gray-800 font-medium transition-all duration-200 hover:bg-[#001AFF] hover:text-white text-left">
                      <span>{item.label}</span>
                    </button>
                  );
                }

                // 워크플레이스 드롭다운
                if (item.href === '#workspace') {
                  const isActive = activeView === 'workspace';
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => {
                          setWorkspaceOpen((prev) => !prev);
                          setActiveView('workspace');
                        }}
                        className={`models-nav-item w-full flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 text-left ${
                          isActive
                            ? 'models-nav-active bg-[#001AFF] text-white'
                            : 'text-gray-800 hover:bg-[#001AFF] hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${workspaceOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {/* 서브메뉴 */}
                      <div
                        className="overflow-hidden transition-all duration-300"
                        style={{ maxHeight: workspaceOpen ? 160 : 0, opacity: workspaceOpen ? 1 : 0 }}
                      >
                        <div className="flex flex-col gap-0.5 pl-4 pt-1">
                          {([
                            { key: 'my' as const, label: '나의 모델' },
                            { key: 'shared' as const, label: '공유받은 모델' },
                            { key: 'bookmark' as const, label: '북마크' },
                          ]).map((sub) => (
                            <button
                              key={sub.key}
                              onClick={() => { setWorkspaceTab(sub.key); setActiveView('workspace'); }}
                              className={`w-full text-left px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                                workspaceTab === sub.key && isActive
                                  ? 'bg-[#E8ECFF] text-[#001AFF]'
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              {sub.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                // 홈 버튼 — 클릭 시 workspace 닫고 home 뷰로
                if (item.href === '/models') {
                  return (
                    <button key={item.label}
                      onClick={() => { setActiveView('home'); setWorkspaceOpen(false); }}
                      className={`models-nav-item w-full flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 text-left ${
                        activeView === 'home'
                          ? 'models-nav-active bg-[#001AFF] text-white'
                          : 'text-gray-800 hover:bg-[#001AFF] hover:text-white'
                      }`}>
                      <span>{item.label}</span>
                    </button>
                  );
                }

                // FAQ
                if (item.href === '#faq') {
                  return (
                    <button key={item.label} onClick={() => setShowFaq(true)}
                      className="models-nav-item w-full flex items-center px-4 py-3 rounded-xl text-[15px] text-gray-800 font-medium transition-all duration-200 hover:bg-[#001AFF] hover:text-white text-left">
                      <span>{item.label}</span>
                    </button>
                  );
                }

                // 공지사항
                if (item.href === '#notice') {
                  return (
                    <button key={item.label} onClick={() => setShowNotice(true)}
                      className="models-nav-item w-full flex items-center px-4 py-3 rounded-xl text-[15px] text-gray-800 font-medium transition-all duration-200 hover:bg-[#001AFF] hover:text-white text-left">
                      <span>{item.label}</span>
                    </button>
                  );
                }

                // 기타 링크
                return (
                  <Link key={item.label} href={item.href}
                    className="models-nav-item flex items-center px-4 py-3 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-[#001AFF] hover:text-white transition-all duration-200">
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {user && (
                <button onClick={handleLogout} disabled={loggingOut}
                  className="models-nav-item w-full flex items-center px-4 py-3 mt-1 rounded-xl text-[15px] font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 disabled:opacity-50">
                  <span>{loggingOut ? '로그아웃 중...' : '로그아웃'}</span>
                </button>
              )}
            </nav>
          </div>

          <div className="px-5 pb-6">
            <div className="text-[11px] text-gray-400 leading-relaxed">
              <p>약관 유료상품 이용약관 사업자정보</p>
              <p className="font-semibold text-gray-500 mt-1">개인정보처리방침</p>
              <p className="mt-1">@Sinvex Corp. @TEDCHANG Corp.</p>
            </div>
          </div>
        </aside>

        {/* ══════ 메인 콘텐츠 ══════ */}
        <main className="flex-1 overflow-y-auto flex flex-col">

          {activeView === 'workspace' ? (
            /* ══════ 워크플레이스 뷰 ══════ */
            <div className="px-10 pt-10 pb-14 flex-1" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
              {/* 헤더 + 최신순 필터 */}
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-[40px] font-extrabold text-gray-900 tracking-tight">
                  {displayName}님의 워크플레이스 <span className="inline-block" style={{ fontSize: 36 }}>&#x1F3E0;</span>
                </h1>

                <div className="flex items-center gap-3 shrink-0 mt-2">
                  {/* 검색창 */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for..."
                      className="h-[42px] w-[220px] pl-4 pr-10 rounded-full border border-gray-300 bg-white text-[14px] text-gray-700 placeholder-gray-400 outline-none focus:border-[#001AFF] transition-colors"
                    />
                    <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* 새 파일 등록하기 */}
                  <Link
                    href="/upload"
                    className="h-[42px] px-6 rounded-full bg-[#001AFF] text-white text-[14px] font-semibold flex items-center justify-center whitespace-nowrap hover:bg-[#0014CC] transition-colors"
                  >
                    새 파일 등록하기
                  </Link>

                  {/* 최신순 드롭다운 */}
                  <div className="relative">
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as 'latest' | 'name' | 'oldest')}
                      className="appearance-none h-[42px] pl-4 pr-10 rounded-xl border border-gray-200 bg-white text-[14px] font-medium text-gray-700 cursor-pointer outline-none focus:border-[#001AFF] transition-colors"
                    >
                      <option value="latest">최신순</option>
                      <option value="oldest">오래된순</option>
                      <option value="name">이름순</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ── 나의 모델 섹션 ── */}
              {workspaceTab === 'my' && (
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[22px] font-bold text-gray-900">나의 모델</h2>
                    <button className="text-[14px] font-medium text-gray-400 hover:text-gray-600 transition-colors">전체보기</button>
                  </div>

                  {(() => {
                    const q = searchQuery.toLowerCase();
                    const allMyModels = [
                      ...viewerModels.map((m) => ({ type: 'builtin' as const, ...m })),
                      ...myUploadedModels.map((m) => ({
                        type: 'user' as const,
                        id: m.id,
                        href: `/viewer/u-${m.id}`,
                        name: m.name,
                        nameKo: m.name,
                        description: m.description || '',
                        category: m.category,
                        partsCount: (m.parts_config as unknown[]).length,
                        thumbnails: m.thumbnail_storage_path ? [getPublicUrl(m.thumbnail_storage_path)] : undefined,
                        hasSim: false,
                        isPublic: m.is_public,
                        visibility: (m.visibility || (m.is_public ? 'public' : 'private')) as 'public' | 'shared' | 'private',
                      })),
                    ].filter((m) =>
                      !q || m.name.toLowerCase().includes(q) || m.nameKo.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
                    );

                    if (sortOrder === 'name') allMyModels.sort((a, b) => a.name.localeCompare(b.name));
                    if (sortOrder === 'oldest') allMyModels.reverse();

                    if (allMyModels.length === 0) {
                      return (
                        <div className="text-center py-20">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p className="text-[16px] text-gray-400">
                            {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다` : '아직 모델이 없습니다'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="relative group/scroll">
                        {/* 좌측 화살표 */}
                        <button
                          onClick={() => scrollLeft(scrollMyRef)}
                          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all opacity-0 group-hover/scroll:opacity-100 shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        {/* 카드 가로 스크롤 */}
                        <div ref={scrollMyRef} className="flex gap-5 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {allMyModels.map((model, i) => (
                            <Link key={`${model.type}-${model.id}`} href={model.href}
                              className="group shrink-0 w-[280px] models-card" style={{ animationDelay: `${i * 60}ms` }}>
                              <div className="models-card-inner rounded-2xl overflow-hidden bg-white border border-gray-200 h-full">
                                <div className="relative h-[180px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
                                  {model.thumbnails && model.thumbnails.length > 0 ? (
                                    <ThumbnailSlideshow images={model.thumbnails} />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg className="w-14 h-14 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                      </svg>
                                    </div>
                                  )}
                                  {/* 공개/비공개/공유 */}
                                  <div className="absolute bottom-2.5 right-2.5">
                                    <VisibilityDropdown
                                      state={'visibility' in model ? model.visibility : 'public'}
                                      onChange={(next) => {
                                        if (model.type === 'user') changeVisibility(model.id, next);
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors truncate">
                                        {model.name}
                                      </h3>
                                      <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                      <circle cx="12" cy="6" r="1.5" />
                                      <circle cx="12" cy="12" r="1.5" />
                                      <circle cx="12" cy="18" r="1.5" />
                                    </svg>
                                  </div>
                                  <p className="text-[13px] font-semibold text-[#001AFF] mb-2">공학 &gt; {model.category}</p>
                                  <p className="text-[12px] text-gray-500 mb-0.5 truncate">{model.nameKo}</p>
                                  <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">{model.description}</p>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>

                        {/* 우측 화살표 */}
                        <button
                          onClick={() => scrollRight(scrollMyRef)}
                          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    );
                  })()}
                </section>
              )}

              {/* ── 공유받은 모델 섹션 ── */}
              {workspaceTab === 'shared' && (
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[22px] font-bold text-gray-900">공유받은 모델</h2>
                    <button className="text-[14px] font-medium text-gray-400 hover:text-gray-600 transition-colors">전체보기</button>
                  </div>

                  {(() => {
                    const q = searchQuery.toLowerCase();
                    let sharedModels = communityModels
                      .filter((m) => m.user_id !== user?.id)
                      .filter((m) =>
                        !q || m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q)
                      );
                    if (sortOrder === 'name') sharedModels = [...sharedModels].sort((a, b) => a.name.localeCompare(b.name));
                    if (sortOrder === 'oldest') sharedModels = [...sharedModels].reverse();

                    if (sharedModels.length === 0) {
                      return (
                        <div className="text-center py-20">
                          <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <p className="text-[16px] text-gray-400">
                            {searchQuery ? `"${searchQuery}" 검색 결과가 없습니다` : '공유받은 모델이 없습니다'}
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="relative group/scroll">
                        <button
                          onClick={() => scrollLeft(scrollSharedRef)}
                          className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all opacity-0 group-hover/scroll:opacity-100 shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <div ref={scrollSharedRef} className="flex gap-5 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {sharedModels.map((model, i) => {
                            const thumbnailUrl = model.thumbnail_storage_path
                              ? getPublicUrl(model.thumbnail_storage_path)
                              : null;
                            const partsCount = (model.parts_config as unknown[]).length;
                            return (
                              <Link key={model.id} href={`/viewer/u-${model.id}`}
                                className="group shrink-0 w-[280px] models-card" style={{ animationDelay: `${i * 60}ms` }}>
                                <div className="models-card-inner rounded-2xl overflow-hidden bg-white border border-gray-200 h-full">
                                  <div className="relative h-[180px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
                                    {thumbnailUrl ? (
                                      <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-14 h-14 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                        </svg>
                                      </div>
                                    )}
                                    <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <div className="flex items-center justify-between mb-1.5">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors truncate">
                                          {model.name}
                                        </h3>
                                        <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </div>
                                      <svg className="w-5 h-5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                        <circle cx="12" cy="6" r="1.5" />
                                        <circle cx="12" cy="12" r="1.5" />
                                        <circle cx="12" cy="18" r="1.5" />
                                      </svg>
                                    </div>
                                    <p className="text-[13px] font-semibold text-[#001AFF] mb-2">공학 &gt; {model.category}</p>
                                    <p className="text-[12px] text-gray-500 mb-0.5 truncate">{model.name}</p>
                                    <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">{model.description || '설명 없음'}</p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        <button
                          onClick={() => scrollRight(scrollSharedRef)}
                          className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all shadow-lg"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    );
                  })()}
                </section>
              )}

              {/* ── 북마크 섹션 ── */}
              {workspaceTab === 'bookmark' && (
                <section>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[22px] font-bold text-gray-900">북마크</h2>
                    <button className="text-[14px] font-medium text-gray-400 hover:text-gray-600 transition-colors">전체보기</button>
                  </div>

                  {!scrapsLoaded ? (
                    <div className="flex justify-center py-20">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : builtinScrapModels.length === 0 && scrapUserModels.length === 0 ? (
                    <div className="text-center py-20">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <p className="text-[16px] text-gray-400 mb-4">아직 북마크한 모델이 없습니다</p>
                      <button
                        onClick={() => { setActiveView('home'); setWorkspaceOpen(false); }}
                        className="inline-block px-6 py-2.5 rounded-full bg-[#001AFF] text-white text-[14px] font-semibold hover:bg-[#0015CC] transition-colors">
                        모델 둘러보기
                      </button>
                    </div>
                  ) : (
                    <div className="relative group/scroll">
                      <button
                        onClick={() => scrollLeft(scrollBookmarkRef)}
                        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all opacity-0 group-hover/scroll:opacity-100 shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      <div ref={scrollBookmarkRef} className="flex gap-5 overflow-x-auto pb-4 scroll-smooth" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {/* builtin 스크랩 */}
                        {builtinScrapModels.map(({ model }, i) => {
                          const thumb = model.thumbnails?.[0] || model.thumbnail;
                          return (
                            <Link key={model.id} href={`/viewer/${model.id}`}
                              className="group shrink-0 w-[280px] models-card" style={{ animationDelay: `${i * 60}ms` }}>
                              <div className="models-card-inner rounded-2xl overflow-hidden bg-white border border-gray-200 h-full">
                                <div className="relative h-[180px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
                                  {thumb ? (
                                    <Image src={thumb} alt={model.nameKo} fill className="object-cover" sizes="280px" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg className="w-14 h-14 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                      </svg>
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleScrap({ model_type: 'builtin', model_id: model.id }); }}
                                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/30 text-red-400 hover:text-red-300 transition-colors"
                                    title="북마크 해제"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                  </button>
                                  <div className="absolute bottom-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  </div>
                                </div>
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors truncate">
                                        {model.name}
                                      </h3>
                                      <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                      <circle cx="12" cy="6" r="1.5" />
                                      <circle cx="12" cy="12" r="1.5" />
                                      <circle cx="12" cy="18" r="1.5" />
                                    </svg>
                                  </div>
                                  <p className="text-[13px] font-semibold text-[#001AFF] mb-2">공학 &gt; {model.category}</p>
                                  <p className="text-[12px] text-gray-500 mb-0.5 truncate">{model.nameKo}</p>
                                  <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">{model.description}</p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}

                        {/* user 스크랩 */}
                        {scrapUserModels.map((model, i) => {
                          const thumbnailUrl = model.thumbnail_storage_path
                            ? getPublicUrl(model.thumbnail_storage_path)
                            : null;
                          return (
                            <Link key={model.id} href={`/viewer/u-${model.id}`}
                              className="group shrink-0 w-[280px] models-card" style={{ animationDelay: `${(builtinScrapModels.length + i) * 60}ms` }}>
                              <div className="models-card-inner rounded-2xl overflow-hidden bg-white border border-gray-200 h-full">
                                <div className="relative h-[180px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
                                  {thumbnailUrl ? (
                                    <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <svg className="w-14 h-14 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                      </svg>
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleScrap({ model_type: 'user', model_id: model.id, user_model_id: model.id }); }}
                                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/30 text-red-400 hover:text-red-300 transition-colors"
                                    title="북마크 해제"
                                  >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                  </button>
                                </div>
                                <div className="p-4">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors truncate">
                                        {model.name}
                                      </h3>
                                      <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                      </svg>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                      <circle cx="12" cy="6" r="1.5" />
                                      <circle cx="12" cy="12" r="1.5" />
                                      <circle cx="12" cy="18" r="1.5" />
                                    </svg>
                                  </div>
                                  <p className="text-[13px] font-semibold text-[#001AFF] mb-2">공학 &gt; {model.category}</p>
                                  <p className="text-[12px] text-gray-500 mb-0.5 truncate">{model.name}</p>
                                  <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">{model.description || '설명 없음'}</p>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => scrollRight(scrollBookmarkRef)}
                        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-all shadow-lg"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </section>
              )}
            </div>
          ) : (
            /* ══════ 홈 뷰 (기존 콘텐츠) ══════ */
            <>
              {/* ── 히어로 ── */}
              <section className="models-hero px-10 pt-16 pb-14 text-center bg-white">
                <h1 className="text-[40px] font-extrabold text-gray-900 mb-4 tracking-tight">
                  {user ? (
                    <>안녕하세요, {displayName}님{' '}<span className="models-wave">&#x1F44B;</span></>
                  ) : (
                    <>안녕하세요{' '}<span className="models-wave">&#x1F44B;</span></>
                  )}
                </h1>
                <p className="text-[16px] text-gray-500 leading-relaxed max-w-md mx-auto">
                  3D모델을 등록하고 자유롭게 학습하세요.<br />
                  fbx, obj, glb 포맷을 지원합니다.
                </p>
                <div className="mt-10">
                  {user ? (
                    <Link href="/upload"
                      className="models-cta-btn inline-block px-16 py-4 bg-[#001AFF] text-white text-[17px] font-bold rounded-full">
                      <span className="relative z-10">새 파일 등록하기</span>
                    </Link>
                  ) : (
                    <button onClick={() => setShowLogin(true)}
                      className="models-cta-btn inline-block px-16 py-4 bg-[#001AFF] text-white text-[17px] font-bold rounded-full">
                      <span className="relative z-10">새 파일 등록하기</span>
                    </button>
                  )}
                </div>
              </section>

              {/* ── 최근 열어본 파일 (로그인 시에만) ── */}
              {user && (
                <section className="px-10 pb-14 pt-4">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[20px] font-bold text-gray-900">최근 열어본 파일</h2>
                    <Link href="#" className="text-[14px] text-gray-400 hover:text-gray-600 transition-colors">
                      전체보기
                    </Link>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {recentModels.map((model, i) => (
                      <ModelCard key={model.id} model={model} delay={200 + i * 100} />
                    ))}
                  </div>
                </section>
              )}

              {/* 푸터를 맨 밑으로 밀어주는 스페이서 */}
              {!user && <div className="flex-1" />}

              {/* ── 푸터 (비로그인 시에만) ── */}
              {!user && (
                <>
                  {/* Contact Us */}
                  <section className="bg-[#3d3d3d] text-white px-8 py-8">
                    <h2 className="text-[20px] font-bold text-center mb-6">Contact Us</h2>
                    <div className="max-w-2xl mx-auto grid grid-cols-3 gap-6">
                      <div>
                        <h3 className="text-[13px] font-bold mb-2.5">Product</h3>
                        <ul className="space-y-1 text-[12px] text-gray-400">
                          <li>Diam orci</li>
                          <li>Mi feugiat</li>
                          <li>Netus fermentum</li>
                          <li>Suspendisse viverra</li>
                          <li>Id dolor</li>
                          <li>Erat mattis</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold mb-2.5">Information</h3>
                        <ul className="space-y-1 text-[12px] text-gray-400">
                          <li>Nibh</li>
                          <li>Egestas</li>
                          <li>Dictum</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="text-[13px] font-bold mb-2.5">Company</h3>
                        <ul className="space-y-1 text-[12px] text-gray-400">
                          <li>Id maecenas</li>
                          <li>Id orci</li>
                          <li>Magna ultricies</li>
                          <li>Quis risus</li>
                        </ul>
                      </div>
                    </div>

                    {/* 점선 구분자 */}
                    <div className="flex items-center justify-center my-6">
                      <div className="flex-1 border-t border-dashed border-gray-500" />
                      <svg className="w-5 h-5 text-[#5bbad5] mx-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <div className="flex-1 border-t border-dashed border-gray-500" />
                    </div>

                    {/* 단체사진 */}
                    <p className="text-center text-[16px] font-semibold text-white">단체사진</p>
                  </section>

                  {/* 하단 바 */}
                  <footer className="bg-[#3d3d3d] border-t border-gray-600 px-8 py-5">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                      <span className="text-[18px] font-extrabold text-white tracking-tight" style={{ fontFamily: 'Righteous' }}>SIMVEX</span>
                      <div className="flex items-center gap-5 text-[12px] text-gray-300">
                        <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Cookies</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        {/* LinkedIn */}
                        <div className="w-8 h-8 rounded-full bg-[#555] flex items-center justify-center hover:bg-[#0077B5] transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </div>
                        {/* Facebook */}
                        <div className="w-8 h-8 rounded-full bg-[#555] flex items-center justify-center hover:bg-[#1877F2] transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </div>
                        {/* Link */}
                        <div className="w-8 h-8 rounded-full bg-[#555] flex items-center justify-center hover:bg-[#001AFF] transition-colors cursor-pointer">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        </div>
                      </div>
                    </div>
                  </footer>
                </>
              )}
            </>
          )}

        </main>
      </div>

      {/* ══════ 로그인 모달 ══════ */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* ══════ FAQ 모달 ══════ */}
      {showFaq && <FaqModal onClose={() => setShowFaq(false)} />}

      {/* ══════ 공지사항 모달 ══════ */}
      {showNotice && <NoticeModal onClose={() => setShowNotice(false)} />}
    </div>
  );
}
