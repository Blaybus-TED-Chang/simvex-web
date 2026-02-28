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
  { label: '마이페이지', href: '/mypage', requireAuth: true },
  { label: 'FAQ', href: '#faq', requireAuth: false },
  { label: '공지사항', href: '#notice', requireAuth: false },
];

/* ── FAQ 데이터 ── */
const FAQ_DATA = [
  {
    q: 'VEXA는 어떤 서비스인가요?',
    a: 'VEXA는 3D 기계 부품 모델을 웹에서 조립·분해하며 학습할 수 있는 공학 교육 플랫폼입니다. 드론, 로봇팔, 서스펜션 등 다양한 모델을 직접 회전·확대하며 구조를 파악할 수 있습니다.',
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
    a: 'VEXA는 웹 기반 서비스로, Chrome·Edge·Safari 등 최신 브라우저가 설치된 PC·태블릿에서 별도 설치 없이 바로 사용할 수 있습니다.',
  },
  {
    q: '분해도 슬라이더는 어떻게 사용하나요?',
    a: '뷰어 화면 하단의 슬라이더를 드래그하면 0%(완제품)에서 100%(완전 분해)까지 부품을 실시간으로 분리하거나 조립할 수 있습니다. 각 부품이 어디에 위치하는지 직관적으로 확인할 수 있습니다.',
  },
];

/* ── FAQ 카드 컴포넌트 ── */
function FaqCard({ item, idx }: { item: typeof FAQ_DATA[number]; idx: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        animation: `fadeInUp 0.35s ease ${idx * 0.06}s both`,
        background: isOpen ? '#fff' : '#FAFBFC',
        border: isOpen ? '1px solid #D4D9E4' : '1px solid #F0F0F0',
        boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <button
        className="w-full flex items-start gap-4 px-6 py-5 text-left"
        style={{ cursor: 'pointer', background: 'none', border: 'none' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`shrink-0 w-7 h-7 mt-0.5 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
          isOpen ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          <span>{idx + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[15px] font-semibold leading-snug transition-colors duration-300 ${
            isOpen ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {item.q}
          </p>
        </div>

        <div className="shrink-0 mt-2 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke={isOpen ? '#374151' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      <div
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? 300 : 0,
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        }}
      >
        <div className="px-6 pb-5 pl-[60px]">
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[14px] text-gray-500 leading-[24px] mt-2">
              {item.a}
            </p>
          </div>
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
    title: 'VEXA 오픈 베타 출시 안내',
    date: '2026.02.10',
    body: '안녕하세요, VEXA 팀입니다. 오늘부터 VEXA 오픈 베타 서비스를 시작합니다. 3D 모델 뷰어, 분해도 학습, AI 어시스턴트 등 핵심 기능을 자유롭게 이용해보세요. 베타 기간 동안 발견되는 버그나 개선 의견은 언제든 환영합니다.',
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

/* ── 공지사항 카드 컴포넌트 ── */
function NoticeCard({ item, idx }: { item: typeof NOTICE_DATA[number]; idx: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const tagColorMap: Record<string, string> = {
    '점검': '#991B1B', '안내': '#92400E', '업데이트': '#065F46', '서비스': '#3730A3',
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        animation: `fadeInUp 0.35s ease ${idx * 0.06}s both`,
        background: isOpen ? '#fff' : '#FAFBFC',
        border: isOpen ? '1px solid #D4D9E4' : '1px solid #F0F0F0',
        boxShadow: isOpen ? '0 4px 20px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <button
        className="w-full flex items-start gap-4 px-6 py-5 text-left"
        style={{ cursor: 'pointer', background: 'none', border: 'none' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* 핀 또는 번호 */}
        <div className={`shrink-0 w-7 h-7 mt-0.5 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
          isOpen ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-500'
        }`}>
          <span>{idx + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          {/* 태그 + 날짜 */}
          <div className="flex items-center gap-2.5 mb-2">
            <span
              className="px-2.5 py-0.5 rounded-md text-[11.5px] font-semibold"
              style={{ background: item.tagColor, color: tagColorMap[item.tag] || '#3730A3' }}
            >
              {item.tag}
            </span>
            <span className="text-[12px] text-gray-400">{item.date}</span>
          </div>

          {/* 제목 */}
          <p className={`text-[15px] font-semibold leading-snug transition-colors duration-300 ${
            isOpen ? 'text-gray-900' : 'text-gray-700'
          }`}>
            {item.title}
          </p>
        </div>

        {/* 셰브론 */}
        <div className="shrink-0 mt-2 transition-transform duration-300" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M4 6L8 10L12 6" stroke={isOpen ? '#374151' : '#9CA3AF'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* 본문 */}
      <div
        className="overflow-hidden"
        style={{
          maxHeight: isOpen ? 300 : 0,
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
        }}
      >
        <div className="px-6 pb-5 pl-[60px]">
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[14px] text-gray-500 leading-[24px] mt-2">
              {item.body}
            </p>
          </div>
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
function ModelCard({ model, delay, onRename }: {
  model: { id: string; href: string; name: string; nameKo: string; description: string; category: string; partsCount: number; thumbnails?: string[]; hasSim: boolean };
  delay: number;
  onRename?: (modelId: string, newName: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditValue(model.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== model.name && onRename) {
      onRename(model.id, trimmed);
    }
  };

  return (
    <Link href={model.href} className="group models-card" style={{ animationDelay: `${delay}ms` }} onClick={(e) => { if (isEditing) e.preventDefault(); }}>
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
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[16px] font-bold w-full px-1.5 py-0.5 rounded-md border border-blue-400 bg-white text-gray-900 outline-none focus:ring-1 focus:ring-blue-200"
                />
              ) : (
                <>
                  <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors truncate">
                    {model.name}
                  </h3>
                  {onRename && (
                    <button
                      onClick={handleStartEdit}
                      className="p-0.5 rounded text-gray-300 hover:text-[#001AFF] transition-colors shrink-0"
                      title="이름 편집"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
            <svg className="w-5 h-5 text-gray-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
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

/* ── 최근 열어본 파일 캐러셀 ── */
function RecentModelsCarousel({ models, onRename }: {
  models: { id: string; href: string; name: string; nameKo: string; description: string; category: string; partsCount: number; thumbnails?: string[]; hasSim: boolean }[];
  onRename?: (modelId: string, newName: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const CARD_W = 320;
  const GAP = 24;

  // 자동 스크롤 (JS interval 기반)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const interval = setInterval(() => {
      if (pausedRef.current) return;
      el.scrollLeft += 1;
      // 끝에 도달하면 처음으로
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0;
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const scrollManual = (dir: 'left' | 'right') => {
    const el = trackRef.current;
    if (!el) return;
    const shift = dir === 'left' ? -(CARD_W + GAP) : (CARD_W + GAP);
    el.scrollBy({ left: shift, behavior: 'smooth' });
    pausedRef.current = true;
    setTimeout(() => { pausedRef.current = false; }, 3000);
  };

  return (
    <section className="pb-14 pt-4">
      <div className="flex items-center justify-between mb-6 px-10">
        <h2 className="text-[20px] font-bold text-gray-900">최근 열어본 파일</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollManual('left')}
            className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scrollManual('right')}
            className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* 양쪽 그라데이션 */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div
          ref={trackRef}
          className="flex gap-6 px-10 hide-scrollbar"
          style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseEnter={() => { pausedRef.current = true; }}
          onMouseLeave={() => { pausedRef.current = false; }}
        >
          {/* 원본 + 복제본 (무한 루프) */}
          {[...models, ...models].map((model, i) => (
            <div key={`${model.id}-${i}`} className="shrink-0" style={{ width: CARD_W }}>
              <ModelCard model={model} delay={0} onRename={onRename} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ModelsPage() {
  const { user } = useUser();
  const { models: myUploadedModels, fetchPublicModels, changeVisibility } = useUserModels(user);
  const { scraps, loaded: scrapsLoaded, toggleScrap } = useScraps(user);
  const [communityModels, setCommunityModels] = useState<UserModelRow[]>([]);

  // 워크플레이스 뷰 상태
  const [activeView, setActiveView] = useState<'home' | 'workspace' | 'notice' | 'faq'>('home');
  const [workspaceTab, setWorkspaceTab] = useState<'my' | 'shared' | 'bookmark' | 'workflow'>('my');
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  // 북마크 탭용 스크랩 user 모델 데이터
  const [scrapUserModels, setScrapUserModels] = useState<UserModelRow[]>([]);

  const { getModelState, setModelState } = useViewerStore();
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

  // eslint-disable-next-line react-hooks/set-state-in-effect
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
      id: m.id, href: `/viewer/${m.id}`, nameKo: m.nameKo,
      name: getModelState(m.id)?.rootName || m.name,
      description: m.description, category: m.category, partsCount: m.parts.length,
      thumbnails: m.thumbnails, hasSim: hasSimulation(m.id),
    })),
    {
      id: suspensionModel.id, href: `/viewer/${suspensionModel.id}`,
      nameKo: suspensionModel.nameKo, name: getModelState(suspensionModel.id)?.rootName || suspensionModel.name,
      description: suspensionModel.description, category: suspensionModel.category,
      partsCount: suspensionModel.parts.length, thumbnails: suspensionModel.thumbnails, hasSim: false,
    },
    {
      id: 'jet-engine', href: '/viewer/jet-engine?tab=sim',
      nameKo: '터보팬 엔진', name: getModelState('jet-engine')?.rootName || 'Turbofan Engine Simulator',
      description: '제트 엔진의 인터랙티브 시각화와 기류 파티클, 실시간 성능 지표를 확인할 수 있습니다',
      category: '항공', partsCount: 0, thumbnails: undefined as string[] | undefined, hasSim: true,
    },
  ];

  // 검색 & 정렬
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'name' | 'oldest'>('latest');

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || '사용자';
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const [showLogin, setShowLogin] = useState(false);
  const router = useRouter();
  const [loggingOut, startLogout] = useTransition();

  // 스크롤 ref
  const scrollMyRef = useRef<HTMLDivElement>(null);
  const scrollSharedRef = useRef<HTMLDivElement>(null);

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
          VEXA
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
                        style={{ maxHeight: workspaceOpen ? 200 : 0, opacity: workspaceOpen ? 1 : 0 }}
                      >
                        <div className="flex flex-col gap-0.5 pl-4 pt-1">
                          {([
                            { key: 'my' as const, label: '나의 모델' },
                            { key: 'shared' as const, label: '공유받은 모델' },
                            { key: 'bookmark' as const, label: '스크랩한 모델' },
                            { key: 'workflow' as const, label: '워크플로우' },
                          ]).map((sub) => (
                            sub.key === 'workflow' ? (
                              <Link
                                key={sub.key}
                                href="/workflow"
                                className={`w-full text-left px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900`}
                              >
                                {sub.label}
                              </Link>
                            ) : (
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
                            )
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
                  const isActive = activeView === 'faq';
                  return (
                    <button key={item.label} onClick={() => setActiveView(isActive ? 'home' : 'faq')}
                      className={`models-nav-item w-full flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 text-left ${
                        isActive ? 'bg-[#001AFF] text-white' : 'text-gray-800 hover:bg-[#001AFF] hover:text-white'
                      }`}>
                      <span>{item.label}</span>
                    </button>
                  );
                }

                // 공지사항
                if (item.href === '#notice') {
                  const isActive = activeView === 'notice';
                  return (
                    <button key={item.label} onClick={() => setActiveView(isActive ? 'home' : 'notice')}
                      className={`models-nav-item w-full flex items-center px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 text-left ${
                        isActive ? 'bg-[#001AFF] text-white' : 'text-gray-800 hover:bg-[#001AFF] hover:text-white'
                      }`}>
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
              <p className="mt-1">@VEXA Corp. @TEDCHANG Corp.</p>
            </div>
          </div>
        </aside>

        {/* ══════ 메인 콘텐츠 ══════ */}
        <main className="flex-1 overflow-y-auto flex flex-col">

          {activeView === 'faq' ? (
            /* ══════ FAQ 뷰 ══════ */
            <div className="px-10 pt-10 pb-14 flex-1" style={{ fontFamily: "'Apple SD Gothic Neo', 'Pretendard Variable', sans-serif" }}>
              {/* 헤더 */}
              <div className="mb-10" style={{ animation: 'fadeInUp 0.5s ease both' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">자주 묻는 질문</h1>
                    <p className="text-[13px] text-gray-400 mt-0.5">VEXA 이용 가이드</p>
                  </div>
                </div>
              </div>

              {/* FAQ 목록 */}
              <div className="flex flex-col gap-3">
                {FAQ_DATA.map((item, idx) => (
                  <FaqCard key={idx} item={item} idx={idx} />
                ))}
              </div>

              {/* 하단 */}
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-[12px] text-gray-400">
                  더 궁금한 점이 있다면 뷰어의 <span className="text-gray-600 font-medium">AI 어시스턴트</span>를 이용해보세요
                </p>
              </div>
            </div>

          ) : activeView === 'notice' ? (
            /* ══════ 공지사항 뷰 ══════ */
            <div className="px-10 pt-10 pb-14 flex-1" style={{ fontFamily: "'Apple SD Gothic Neo', 'Pretendard Variable', sans-serif" }}>
              {/* 헤더 */}
              <div className="mb-10" style={{ animation: 'fadeInUp 0.5s ease both' }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">공지사항</h1>
                    <p className="text-[13px] text-gray-400 mt-0.5">VEXA 소식과 업데이트</p>
                  </div>
                </div>
              </div>

              {/* 공지 목록 */}
              <div className="flex flex-col gap-3">
                {NOTICE_DATA.map((item, idx) => (
                  <NoticeCard key={idx} item={item} idx={idx} />
                ))}
              </div>

              {/* 하단 */}
              <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <p className="text-[12px] text-gray-400">VEXA 팀은 더 나은 학습 경험을 위해 노력합니다</p>
              </div>
            </div>

          ) : activeView === 'workspace' ? (
            /* ══════ 워크플레이스 뷰 ══════ */
            <div className="px-10 pt-10 pb-14 flex-1" style={{ fontFamily: "'Pretendard Variable', Pretendard, sans-serif" }}>
              {/* 헤더 + 최신순 필터 */}
              <div className="flex items-start justify-between mb-10">
                <h1 className="text-[36px] font-medium text-gray-800 tracking-normal leading-snug" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
                  {displayName}님의 워크플레이스 <span className="inline-block" style={{ fontSize: 32 }}>&#x1F3E0;</span>
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

              {/* ── 스크랩한 모델 섹션 ── */}
              {workspaceTab === 'bookmark' && (
                <section>
                  <h2 className="text-[22px] font-bold text-gray-900 mb-6">스크랩한 모델</h2>

                  {!scrapsLoaded ? (
                    <div className="flex justify-center py-20">
                      <div className="w-8 h-8 border-4 border-[#001AFF] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : builtinScrapModels.length === 0 && scrapUserModels.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <p className="text-[15px] font-medium text-gray-500 mb-1">아직 스크랩한 모델이 없습니다</p>
                      <p className="text-[13px] text-gray-400 mb-4">마음에 드는 모델을 스크랩해보세요</p>
                      <button
                        onClick={() => { setActiveView('home'); setWorkspaceOpen(false); }}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#001AFF] text-white text-[13px] font-semibold rounded-xl hover:bg-[#0015CC] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        모델 둘러보기
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-5">
                      {/* builtin 스크랩 모델 */}
                      {builtinScrapModels.map(({ model }, i) => (
                        <Link key={model.id} href={`/viewer/${model.id}`} className="group models-card" style={{ animationDelay: `${i * 60}ms` }}>
                          <div className="models-card-inner rounded-2xl overflow-hidden bg-white border border-gray-200">
                            <div className="relative h-[180px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
                              {model.thumbnails && model.thumbnails.length > 0 ? (
                                <ThumbnailSlideshow images={model.thumbnails} />
                              ) : model.thumbnail ? (
                                <Image src={model.thumbnail} alt={model.nameKo} fill className="object-cover" sizes="360px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                  </svg>
                                </div>
                              )}
                              <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleScrap({ model_type: 'builtin', model_id: model.id }); }}
                                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-black/50 transition-all"
                                title="스크랩 해제"
                              >
                                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                              </button>
                            </div>
                            <div className="p-4">
                              <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors mb-1">
                                {model.nameKo}
                              </h3>
                              <p className="text-[13px] font-semibold text-[#001AFF] mb-1.5">
                                공학 &gt; {model.category} · {model.parts.length}개 부품
                              </p>
                              <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">
                                {model.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}

                      {/* user 스크랩 모델 */}
                      {scrapUserModels.map((model, i) => {
                        const thumbnailUrl = model.thumbnail_storage_path
                          ? getPublicUrl(model.thumbnail_storage_path)
                          : null;
                        const partsCount = (model.parts_config as unknown[]).length;
                        return (
                          <Link key={model.id} href={`/viewer/u-${model.id}`} className="group models-card" style={{ animationDelay: `${(builtinScrapModels.length + i) * 60}ms` }}>
                            <div className="models-card-inner rounded-2xl overflow-hidden bg-white border border-gray-200">
                              <div className="relative h-[180px] bg-gradient-to-br from-[#1a1a2e] to-[#16213e] overflow-hidden">
                                {thumbnailUrl ? (
                                  <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                    </svg>
                                  </div>
                                )}
                                <button
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleScrap({ model_type: 'user', model_id: model.id, user_model_id: model.id }); }}
                                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-black/50 transition-all"
                                  title="스크랩 해제"
                                >
                                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                  </svg>
                                </button>
                              </div>
                              <div className="p-4">
                                <h3 className="text-[16px] font-bold text-gray-900 group-hover:text-[#001AFF] transition-colors mb-1">
                                  {model.name}
                                </h3>
                                <p className="text-[13px] font-semibold text-[#001AFF] mb-1.5">
                                  공학 &gt; {model.category} · {partsCount}개 부품
                                </p>
                                <p className="text-[12px] text-gray-400 line-clamp-2 leading-relaxed">
                                  {model.description || '설명 없음'}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </section>
              )}
            </div>
          ) : (
            /* ══════ 홈 뷰 (기존 콘텐츠) ══════ */
            <>
              {/* ── 히어로 ── */}
              <section className="models-hero px-10 py-16 text-center bg-white flex-1 flex flex-col items-center justify-center pb-64">
                <h1 className="models-hero-greeting text-[52px] text-gray-900 mb-6 leading-[1.3] pl-12">
                  {user ? (
                    <>
                      <span className="pen-line-1">안녕하세요, <strong>{displayName}</strong>님</span>
                      {' '}<span className="pen-wave-reveal models-wave" style={{ fontSize: 44 }}>&#x1F44B;</span>
                    </>
                  ) : (
                    <>
                      <span className="pen-line-1">안녕하세요</span>
                      {' '}<span className="pen-wave-reveal models-wave" style={{ fontSize: 44 }}>&#x1F44B;</span>
                    </>
                  )}
                </h1>
                <p className="models-hero-subtitle text-[17px] text-gray-600 leading-relaxed max-w-md mx-auto font-normal" style={{ fontFamily: "'Apple SD Gothic Neo', 'Pretendard Variable', sans-serif" }}>
                  3D모델을 등록하고 자유롭게 학습하세요.<br />
                  fbx, obj, glb 포맷을 지원합니다.
                </p>
                <div className="models-hero-cta mt-12">
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
                <RecentModelsCarousel
                  models={viewerModels}
                  onRename={(modelId, newName) => setModelState(modelId, { rootName: newName || undefined })}
                />
              )}

            </>
          )}

        </main>
      </div>

      {/* ══════ 로그인 모달 ══════ */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}


    </div>
  );
}
