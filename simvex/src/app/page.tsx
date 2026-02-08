'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useCallback, useEffect } from 'react';
import { combinedModels } from '@/data/models';
import { suspensionModel } from '@/data/models/suspension';
import { hasSimulation } from '@/data/simulationMapping';
import { AuthButton } from '@/components/auth/AuthButton';
import { ScrapButton } from '@/components/scrap/ScrapButton';
import { ShareButton } from '@/components/share/ShareButton';
import { useViewerStore } from '@/lib/store/viewerStore';
import { useUser } from '@/hooks/useUser';
import { useUserModels, getPublicUrl } from '@/hooks/useUserModels';
import { useScraps } from '@/hooks/useScraps';
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

export default function Home() {
  const { isDarkMode, toggleDarkMode } = useViewerStore();
  const { user } = useUser();
  const { fetchPublicModels } = useUserModels(user);
  const { isScraped, toggleScrap } = useScraps(user);
  const [communityModels, setCommunityModels] = useState<UserModelRow[]>([]);

  // Zustand store hydration (SSR 호환)
  useEffect(() => {
    useViewerStore.persist.rehydrate();
  }, []);

  // 공개 모델 로드 (미리보기 3개)
  useEffect(() => {
    fetchPublicModels(3).then(setCommunityModels);
  }, [fetchPublicModels]);

  // 모델 목록: 통합 모델 + 서스펜션 + 터보팬 엔진 (시뮬레이션 전용)
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
      hasSim: hasSimulation(m.id),
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
      hasSim: false,
    },
    {
      id: 'jet-engine',
      href: '/viewer/jet-engine?tab=sim',
      nameKo: '터보팬 엔진',
      name: 'Turbofan Engine Simulator',
      description: '제트 엔진의 인터랙티브 시각화와 기류 파티클, 실시간 성능 지표를 확인할 수 있습니다',
      category: '항공',
      partsCount: 0,
      thumbnails: undefined as string[] | undefined,
      hasSim: true,
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
            {/* 네비게이션 */}
            <Link
              href="/community"
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
              }`}
              title="커뮤니티 모델"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>
            {user && (
              <Link
                href="/mypage"
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
                }`}
                title="마이페이지"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
            {/* 구분선 */}
            <div className={`w-px h-5 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-300/70'}`} />
            {/* 설정 */}
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
            <AuthButton />
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
          <div className="mt-6">
            <Link
              href="/community"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] ${
                isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              커뮤니티 모델 둘러보기
            </Link>
          </div>
        </div>
      </section>

      {/* 3D 뷰어 & 시뮬레이션 통합 섹션 */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h3 className={`text-sm font-medium uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            3D 뷰어 & 시뮬레이션
          </h3>
          <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            기계 부품의 3D 구조를 분해/조립하고, 인터랙티브 시뮬레이션으로 학습하세요
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
                      {model.partsCount > 0 && (
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-50 text-green-600'
                        }`}>
                          {model.partsCount}개 부품
                        </span>
                      )}
                      {model.hasSim && (
                        <span className={`px-1.5 py-0.5 text-xs rounded ${
                          isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'
                        }`}>
                          시뮬레이션
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{model.name}</p>
                    <p className={`text-sm mt-2 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {model.description}
                    </p>
                  </div>

                  {/* 카테고리 배지 + 스크랩 + 공유 */}
                  <div className="absolute top-3 right-3 flex items-center gap-1">
                    <ScrapButton
                      user={user}
                      isScraped={isScraped('builtin', model.id)}
                      scrapInput={{ model_type: 'builtin', model_id: model.id }}
                      onToggle={toggleScrap}
                      isDarkMode={isDarkMode}
                      size="sm"
                    />
                    <ShareButton
                      modelId={model.id}
                      isDarkMode={isDarkMode}
                      size="sm"
                    />
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

      {/* 커뮤니티 모델 미리보기 섹션 */}
      {communityModels.length > 0 && (
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                커뮤니티 모델
              </h3>
              <div className="flex items-center gap-2">
                <Link
                  href="/community"
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    isDarkMode
                      ? 'text-purple-400 hover:bg-gray-800'
                      : 'text-purple-600 hover:bg-gray-100'
                  }`}
                >
                  전체 보기
                </Link>
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
            </div>
            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              사용자들이 업로드한 3D 모델
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communityModels.map((model) => {
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

                      {/* 카테고리 + 스크랩 + 공유 */}
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        <ScrapButton
                          user={user}
                          isScraped={isScraped('user', model.id)}
                          scrapInput={{ model_type: 'user', model_id: model.id, user_model_id: model.id }}
                          onToggle={toggleScrap}
                          isDarkMode={isDarkMode}
                          size="sm"
                        />
                        <ShareButton
                          modelId={`u-${model.id}`}
                          isDarkMode={isDarkMode}
                          size="sm"
                        />
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
      )}

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
