'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useCallback, useEffect } from 'react';
import { combinedModels } from '@/data/models';
import { suspensionModel } from '@/data/models/suspension';
import { AuthButton } from '@/components/auth/AuthButton';
import { useViewerStore } from '@/lib/store/viewerStore';

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

  // Zustand store hydration (SSR 호환)
  useEffect(() => {
    useViewerStore.persist.rehydrate();
  }, []);

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
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-2xl font-bold text-white">S</span>
            </div>
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
