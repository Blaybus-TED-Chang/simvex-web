'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useCallback, useEffect } from 'react';
import { combinedModels } from '@/data/models';
import { suspensionModel } from '@/data/models/suspension';
import { AuthButton } from '@/components/auth/AuthButton';
import { useViewerStore } from '@/lib/store/viewerStore';
import { useUser } from '@/hooks/useUser';
import { useUserModels, getPublicUrl } from '@/hooks/useUserModels';
import type { UserModelRow } from '@/types/userModel';

function ThumbnailSlideshow({ images, isDarkMode }: { images: string[]; isDarkMode: boolean }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSlideshow = useCallback(() => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 1200);
  }, [images.length]);

  const stopSlideshow = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setCurrentIndex(0);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div
      className={`relative aspect-video overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
      onMouseEnter={startSlideshow}
      onMouseLeave={stopSlideshow}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`조립도 ${i + 1}`}
          fill
          className={`object-cover transition-opacity duration-500 ${
            i === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const simulations = [
  {
    id: 'drone-simulator',
    title: '드론 시뮬레이터',
    description: '쿼드콥터 드론의 스로틀/요/피치/롤을 조절하여 비행 원리와 모터 믹싱을 학습할 수 있습니다',
    href: '/viewer/drone-combined?tab=sim',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3l14 9-14 9V3z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-600',
    features: ['모터 믹싱', '피치/롤 제어', 'RPM 게이지', '비행 물리'],
    isNew: true,
  },
  {
    id: 'jet-engine',
    title: '터보팬 엔진',
    description: '제트 엔진의 인터랙티브 시각화와 기류 파티클, 실시간 성능 지표를 확인할 수 있습니다',
    href: '/viewer/jet-engine?tab=sim',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-red-600',
    features: ['기류 시각화', '스로틀 제어', '성능 게이지', '부품 상세'],
  },
  {
    id: 'robot-arm',
    title: '로봇 암 시뮬레이터',
    description: '6축 로봇 암의 순운동학/역운동학 제어, 경로 프로그래밍, 궤적 시각화를 체험할 수 있습니다',
    href: '/viewer/robot-arm-combined?tab=sim',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-purple-500 to-pink-600',
    features: ['순운동학', '역운동학', '경로 프로그래밍', '웨이포인트 기록'],
  },
];

export default function Home() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { isDarkMode, toggleDarkMode } = useViewerStore();
  const { user } = useUser();
  const { models: myModels, fetchPublicModels } = useUserModels(user);
  const [communityModels, setCommunityModels] = useState<UserModelRow[]>([]);

  // Zustand store hydration (SSR 호환)
  useEffect(() => {
    useViewerStore.persist.rehydrate();
  }, []);

  // 공개 모델 로드
  useEffect(() => {
    fetchPublicModels(6).then(setCommunityModels);
  }, [fetchPublicModels]);

  // 3D 부품 뷰어에 표시할 모델 목록: 통합 모델 + 서스펜션
  const viewerModels = [
    ...combinedModels.map((m) => ({
      id: m.id,
      href: `/viewer/${m.id}`,
      nameKo: m.nameKo,
      name: m.name,
      description: m.description,
      category: m.category,
      partsCount: m.parts.length,
      thumbnails: m.thumbnails,
    })),
    {
      id: suspensionModel.id,
      href: `/viewer/${suspensionModel.id}`,
      nameKo: suspensionModel.nameKo,
      name: suspensionModel.name,
      description: suspensionModel.description,
      category: suspensionModel.category,
      partsCount: suspensionModel.parts.length,
      thumbnails: suspensionModel.thumbnails,
    },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${
      isDarkMode
        ? 'from-gray-900 via-gray-950 to-black text-white'
        : 'from-gray-50 via-white to-gray-100 text-gray-900'
    }`}>
      {/* 헤더 */}
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="SIMVEX Logo"
              width={48}
              height={48}
              className="rounded-xl shadow-lg"
            />
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>SIMVEX</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>공학 시뮬레이션 플랫폼</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AuthButton />
            {/* 다크모드 토글 */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r ${
            isDarkMode ? 'from-white to-gray-400' : 'from-gray-900 to-gray-500'
          } bg-clip-text text-transparent`}>
            인터랙티브 공학 시뮬레이션
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            3D 시각화를 통해 복잡한 공학 시스템을 탐구하세요.
            읽기만 하지 말고, 직접 체험하며 배우세요.
          </p>
        </div>
      </section>

      {/* 3D 부품 뷰어 섹션 (시뮬레이션보다 위에 배치) */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h3 className={`text-sm font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            3D 부품 뷰어
          </h3>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            기계 부품의 3D 구조를 분해/조립하며 학습하세요
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viewerModels.map((model) => (
              <Link
                key={model.id}
                href={model.href}
                className="group"
              >
                <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                  isDarkMode
                    ? 'border-green-800/50 bg-gray-900/50 backdrop-blur-sm hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10'
                    : 'border-green-200 bg-white shadow-sm hover:border-green-400 hover:shadow-lg'
                }`}>
                  {/* 썸네일 슬라이드쇼 */}
                  {model.thumbnails && model.thumbnails.length > 0 ? (
                    <ThumbnailSlideshow images={model.thumbnails} isDarkMode={isDarkMode} />
                  ) : (
                    <div className={`aspect-video flex items-center justify-center ${
                      isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                    }`}>
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* 콘텐츠 */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold transition-colors ${
                        isDarkMode ? 'text-white group-hover:text-green-400' : 'text-gray-900 group-hover:text-green-600'
                      }`}>
                        {model.nameKo}
                      </h4>
                      <span className={`px-1.5 py-0.5 text-xs rounded ${
                        isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                      }`}>
                        {model.partsCount}개 부품
                      </span>
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{model.name}</p>
                    <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {model.description}
                    </p>
                  </div>

                  {/* 카테고리 배지 */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 text-xs rounded ${
                      isDarkMode ? 'bg-gray-800/80 backdrop-blur text-gray-400' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {model.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 시뮬레이션 섹션 */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h3 className={`text-sm font-medium uppercase tracking-wider mb-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            시뮬레이션
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((sim) => (
              <Link
                key={sim.id}
                href={sim.href}
                className="group relative"
                onMouseEnter={() => setHoveredId(sim.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={`
                  relative overflow-hidden rounded-2xl border
                  ${isDarkMode
                    ? 'border-gray-800 bg-gray-900/50 backdrop-blur-sm'
                    : 'border-gray-200 bg-white shadow-sm'
                  }
                  transition-all duration-300
                  ${hoveredId === sim.id
                    ? isDarkMode
                      ? 'border-gray-600 scale-[1.02] shadow-2xl'
                      : 'border-gray-300 scale-[1.02] shadow-lg'
                    : ''
                  }
                `}>
                  {/* New 배지 */}
                  {sim.isNew && (
                    <div className={`absolute top-4 right-4 px-2 py-1 rounded-full z-10 ${
                      isDarkMode ? 'bg-green-500/20 border border-green-500/50' : 'bg-green-50 border border-green-200'
                    }`}>
                      <span className={`text-xs font-medium ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>NEW</span>
                    </div>
                  )}

                  {/* 콘텐츠 */}
                  <div className="p-6">
                    {/* 아이콘 */}
                    <div className={`
                      w-16 h-16 rounded-xl bg-gradient-to-br ${sim.gradient}
                      flex items-center justify-center mb-4
                      shadow-lg transition-transform duration-300 text-white
                      ${hoveredId === sim.id ? 'scale-110' : ''}
                    `}>
                      {sim.icon}
                    </div>

                    {/* 제목 & 설명 */}
                    <h4 className={`text-xl font-semibold mb-2 transition-colors ${
                      isDarkMode ? 'group-hover:text-white' : 'group-hover:text-gray-900'
                    }`}>
                      {sim.title}
                    </h4>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {sim.description}
                    </p>

                    {/* 기능 태그 */}
                    <div className="flex flex-wrap gap-2">
                      {sim.features.map((feature) => (
                        <span
                          key={feature}
                          className={`px-2 py-1 rounded-md text-xs ${
                            isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 하단 CTA */}
                  <div className={`
                    flex items-center justify-between px-6 py-4
                    border-t transition-colors duration-300
                    ${isDarkMode
                      ? `border-gray-800 bg-gray-900/50 ${hoveredId === sim.id ? 'bg-gray-800/50' : ''}`
                      : `border-gray-100 bg-gray-50/50 ${hoveredId === sim.id ? 'bg-gray-100/50' : ''}`
                    }
                  `}>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>시뮬레이션 시작</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isDarkMode ? 'text-gray-500' : 'text-gray-400'
                      } ${hoveredId === sim.id
                        ? isDarkMode ? 'translate-x-1 text-white' : 'translate-x-1 text-gray-900'
                        : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 커뮤니티 모델 섹션 */}
      {(() => {
        // 공개 모델 + 본인 비공개 모델 합산 (중복 제거)
        const publicIds = new Set(communityModels.map((m) => m.id));
        const privateModels = user
          ? myModels.filter((m) => !m.is_public && !publicIds.has(m.id))
          : [];
        const allUserModels = [...communityModels, ...privateModels];

        if (allUserModels.length === 0) return null;

        return (
          <section className="px-6 pb-20">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  커뮤니티 모델
                </h3>
                {user && (
                  <Link
                    href="/upload"
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      isDarkMode
                        ? 'text-blue-400 hover:bg-gray-800'
                        : 'text-blue-600 hover:bg-gray-100'
                    }`}
                  >
                    내 모델 관리
                  </Link>
                )}
              </div>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                사용자들이 업로드한 3D 모델
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allUserModels.map((model) => {
                  const thumbnailUrl = model.thumbnail_storage_path
                    ? getPublicUrl(model.thumbnail_storage_path)
                    : null;
                  const partsCount = (model.parts_config as unknown[]).length;

                  return (
                    <Link
                      key={model.id}
                      href={`/viewer/u-${model.id}`}
                      className="group"
                    >
                      <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                        isDarkMode
                          ? 'border-purple-800/50 bg-gray-900/50 backdrop-blur-sm hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/10'
                          : 'border-purple-200 bg-white shadow-sm hover:border-purple-400 hover:shadow-lg'
                      }`}>
                        {/* 썸네일 */}
                        <div className={`aspect-video flex items-center justify-center ${
                          isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 to-gray-100'
                        }`}>
                          {thumbnailUrl ? (
                            <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* 콘텐츠 */}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold transition-colors ${
                              isDarkMode ? 'text-white group-hover:text-purple-400' : 'text-gray-900 group-hover:text-purple-600'
                            }`}>
                              {model.name}
                            </h4>
                            <span className={`px-1.5 py-0.5 text-xs rounded ${
                              isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-50 text-purple-600'
                            }`}>
                              {partsCount}개 부품
                            </span>
                          </div>
                          <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {model.description || '설명 없음'}
                          </p>
                        </div>

                        {/* 카테고리 + 공개 배지 */}
                        <div className="absolute top-3 right-3 flex gap-1">
                          {!model.is_public && (
                            <span className={`px-2 py-0.5 text-xs rounded ${
                              isDarkMode ? 'bg-gray-800/80 backdrop-blur text-yellow-400' : 'bg-yellow-50 text-yellow-600'
                            }`}>
                              비공개
                            </span>
                          )}
                          <span className={`px-2 py-0.5 text-xs rounded ${
                            isDarkMode ? 'bg-gray-800/80 backdrop-blur text-gray-400' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {model.category}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

      {/* 업로드 CTA */}
      {user && (
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/upload"
              className={`block p-6 rounded-xl border-2 border-dashed text-center transition-all hover:scale-[1.01] ${
                isDarkMode
                  ? 'border-gray-800 hover:border-blue-500/50 text-gray-500 hover:text-blue-400'
                  : 'border-gray-200 hover:border-blue-400 text-gray-400 hover:text-blue-600'
              }`}
            >
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <p className="font-medium">내 3D 모델 업로드하기</p>
              <p className="text-sm mt-1 opacity-60">GLB 또는 FBX 파일을 업로드하여 커뮤니티에 공유하세요</p>
            </Link>
          </div>
        </section>
      )}

      {/* 푸터 */}
      <footer className={`px-6 py-8 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className={`max-w-6xl mx-auto flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p>SIMVEX - 공학 학습 플랫폼</p>
          <p>교육과 탐구를 위해 만들어졌습니다</p>
        </div>
      </footer>
    </div>
  );
}
