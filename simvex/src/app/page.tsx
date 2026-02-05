'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useCallback, useEffect } from 'react';
import { models, combinedModels } from '@/data/models';
import { AuthButton } from '@/components/auth/AuthButton';

function ThumbnailSlideshow({ images }: { images: string[] }) {
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
      className="relative aspect-video bg-gray-900 overflow-hidden"
      onMouseEnter={startSlideshow}
      onMouseLeave={stopSlideshow}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`Assembly view ${i + 1}`}
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
    id: 'robot-arm',
    title: 'Robot Arm Simulator',
    description: '6-axis robot arm with FK/IK controls, path programming, and trajectory visualization',
    href: '/robot-arm',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-purple-600',
    features: ['Forward Kinematics', 'Inverse Kinematics', 'Path Programming', 'Waypoint Recording'],
  },
  {
    id: 'jet-engine',
    title: 'Turbofan Engine',
    description: 'Interactive jet engine visualization with airflow particles and real-time performance metrics',
    href: '/jet-engine',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-red-600',
    features: ['Airflow Visualization', 'Throttle Control', 'Performance Gauges', 'Component Details'],
    isNew: true,
  },
];

export default function Home() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      {/* Header */}
      <header className="pt-8 pb-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-2xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">SiMVEX</h1>
              <p className="text-sm text-gray-400">Engineering Simulation Platform</p>
            </div>
          </div>
          <AuthButton />
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Interactive Engineering Simulations
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Explore complex engineering systems through interactive 3D visualizations.
            Learn by doing, not just reading.
          </p>
        </div>
      </section>

      {/* Simulations Grid */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-6">
            Available Simulations
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {simulations.map((sim) => (
              <Link
                key={sim.id}
                href={sim.href}
                className="group relative"
                onMouseEnter={() => setHoveredId(sim.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className={`
                  relative overflow-hidden rounded-2xl border border-gray-800
                  bg-gray-900/50 backdrop-blur-sm
                  transition-all duration-300
                  ${hoveredId === sim.id ? 'border-gray-600 scale-[1.02] shadow-2xl' : ''}
                `}>
                  {/* New Badge */}
                  {sim.isNew && (
                    <div className="absolute top-4 right-4 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                      <span className="text-xs font-medium text-green-400">NEW</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    {/* Icon */}
                    <div className={`
                      w-16 h-16 rounded-xl bg-gradient-to-br ${sim.gradient}
                      flex items-center justify-center mb-4
                      shadow-lg transition-transform duration-300
                      ${hoveredId === sim.id ? 'scale-110' : ''}
                    `}>
                      {sim.icon}
                    </div>

                    {/* Title & Description */}
                    <h4 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">
                      {sim.title}
                    </h4>
                    <p className="text-gray-400 text-sm mb-4">
                      {sim.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {sim.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2 py-1 bg-gray-800 rounded-md text-xs text-gray-400"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div className={`
                    flex items-center justify-between px-6 py-4
                    border-t border-gray-800 bg-gray-900/50
                    transition-colors duration-300
                    ${hoveredId === sim.id ? 'bg-gray-800/50' : ''}
                  `}>
                    <span className="text-sm text-gray-500">Launch Simulation</span>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                        hoveredId === sim.id ? 'translate-x-1 text-white' : ''
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

      {/* 3D Parts Viewer Section */}
      <section className="px-6 pb-20">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            3D Parts Viewer
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            기계 부품의 3D 구조를 분해/조립하며 학습하세요
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 통합 GLB 모델 (NEW 뱃지 추가) */}
            {combinedModels.map((model) => (
              <Link
                key={model.id}
                href={`/viewer/${model.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl border border-green-800/50 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:border-green-500/50 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/10">
                  {/* Thumbnail slideshow */}
                  {model.thumbnails && model.thumbnails.length > 0 ? (
                    <ThumbnailSlideshow images={model.thumbnails} />
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white group-hover:text-green-400 transition-colors">
                        {model.nameKo}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                        {model.parts.length}개 부품
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{model.name}</p>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {model.description}
                    </p>
                  </div>

                  {/* Category badge + NEW badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/50 text-xs text-green-400 rounded-full font-medium">
                      NEW
                    </span>
                    <span className="px-2 py-0.5 bg-gray-800/80 backdrop-blur text-xs text-gray-400 rounded">
                      {model.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* 개별 GLB 모델 */}
            {models.map((model) => (
              <Link
                key={model.id}
                href={`/viewer/${model.id}`}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-600 hover:scale-[1.02] hover:shadow-xl">
                  {/* Thumbnail placeholder */}
                  <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                      </svg>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {model.nameKo}
                      </h4>
                      <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                        {model.parts.length}개 부품
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{model.name}</p>
                    <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                      {model.description}
                    </p>
                  </div>

                  {/* Category badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 bg-gray-800/80 backdrop-blur text-xs text-gray-400 rounded">
                      {model.category}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <p>SiMVEX - Engineering Learning Platform</p>
          <p>Built for education and exploration</p>
        </div>
      </footer>
    </div>
  );
}
