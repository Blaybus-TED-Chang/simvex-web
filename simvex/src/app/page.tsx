'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

const CURVE_PATH =
  'M0.0338419 2.34804C246.347 -1.82041 749.414 29.7598 791.178 189.428C832.942 349.096 646.763 532.408 548.453 604.106C398.835 714.319 237.915 965.46 791.178 1088.31C1344.44 1211.17 1522.94 1349.59 1543.03 1403.45';

/** IntersectionObserver로 .fade-in-up 요소에 .visible 토글 */
function useScrollReveal() {
  const observed = useRef(false);

  useEffect(() => {
    if (observed.current) return;
    observed.current = true;

    const els = document.querySelectorAll('.fade-in-up, .why-section');
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/** SVG drawLine 애니메이션용: path 길이 계산 후 적용 */
function useSvgDraw() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    path.style.setProperty('--path-length', String(len));
    path.style.strokeDasharray = String(len);
    path.style.strokeDashoffset = String(len);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            path.style.animation = 'drawLine 2s ease forwards';
          }
        });
      },
      { threshold: 0.1 },
    );
    io.observe(path);
    return () => io.disconnect();
  }, []);

  return pathRef;
}

export default function LandingPage() {
  useScrollReveal();
  const curveRef = useSvgDraw();

  return (
    <div style={{ background: '#F8FAFF', minHeight: '100vh' }}>

      {/* ── 헤더 ── */}
      <header className="landing-header" style={{
        width: '100%', height: 72, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 48px',
        position: 'sticky', top: 0, zIndex: 50, background: '#F8FAFF',
      }}>
        <div className="landing-logo" style={{
          color: 'black', fontSize: 26, fontFamily: 'Righteous', fontWeight: 400,
        }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>SIMVEX</Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <Link href="/" className="landing-nav-link landing-nav" style={{
            color: '#5D5A88', fontSize: 15, fontFamily: 'DM Sans', fontWeight: 400,
            textDecoration: 'none',
          }}>Home</Link>
          <Link href="#about" className="landing-nav-link landing-nav" style={{
            color: '#5D5A88', fontSize: 15, fontFamily: 'DM Sans', fontWeight: 400,
            textDecoration: 'none',
          }}>About</Link>
          <Link href="#pricing" className="landing-nav-link landing-nav" style={{
            color: '#5D5A88', fontSize: 15, fontFamily: 'DM Sans', fontWeight: 400,
            textDecoration: 'none',
          }}>Pricing</Link>
          <Link href="/models" className="landing-btn" style={{
            padding: '10px 22px',
            background: '#001AFF', borderRadius: 24,
            display: 'flex', alignItems: 'center',
            color: 'white', fontSize: 14, fontFamily: 'DM Sans', fontWeight: 700,
            textDecoration: 'none',
          }}>Get started</Link>
        </div>
      </header>

      {/* ── 히어로 섹션 ── */}
      <section className="landing-hero" style={{
        position: 'relative', width: '100%',
        height: 'calc(100vh - 72px)', minHeight: 480, maxHeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {/* 파란 원 */}
        <div style={{
          width: 'min(38vw, 420px)', height: 'min(38vw, 420px)',
          background: '#0019FF', borderRadius: 9999,
          animation: 'pulseGlow 6s ease-in-out infinite',
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }} />

        {/* 구분선 — 원 중앙을 가로지름 */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0,
          borderTop: '2px solid rgba(55,55,55,0.4)',
          transform: 'translateY(10px)',
          zIndex: 2,
          animation: 'fadeIn 0.5s ease both', animationDelay: '1.2s',
        }} />

        {/* 캐치프레이즈 */}
        <div className="landing-hero-catchphrase" style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -90px)',
          zIndex: 3, textAlign: 'center', whiteSpace: 'nowrap',
          animation: 'fadeIn 1s ease both', animationDelay: '0.8s',
        }}>
          <span style={{ color: 'white', fontSize: 15, fontFamily: 'Roboto', fontWeight: 100 }}>아무리 크고 복잡한 기계도 내 손에서</span>
          <span style={{ color: 'white', fontSize: 15, fontFamily: 'Roboto', fontWeight: 500 }}> </span>
          <span style={{ color: 'white', fontSize: 19, fontFamily: 'Roboto', fontWeight: 900 }}>슥</span>
        </div>

        {/* SIMVEX 텍스트 (파란색 — 원 바깥) */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#0019FF', fontSize: 'clamp(90px, 11vw, 150px)', fontFamily: 'Righteous', fontWeight: 400,
          lineHeight: 1, zIndex: 1,
          animation: 'fadeIn 1s ease both', animationDelay: '0.3s',
        }}>SIMVEX</div>

        {/* SIMVEX 텍스트 (흰색 — 원 안쪽 clip) */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(38vw, 420px)', height: 'min(38vw, 420px)',
          borderRadius: 9999, overflow: 'hidden',
          pointerEvents: 'none', zIndex: 2,
        }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white', fontSize: 'clamp(90px, 11vw, 150px)', fontFamily: 'Righteous', fontWeight: 400,
            lineHeight: 1, whiteSpace: 'nowrap',
            animation: 'fadeIn 1s ease both', animationDelay: '0.3s',
          }}>SIMVEX</div>
        </div>
      </section>

      {/* ── Why, SIMVEX? 섹션 ── */}
      <section className="why-section" style={{
        position: 'relative', width: '100%', aspectRatio: '16 / 9',
        minHeight: 500, overflow: 'hidden',
      }}>
        {/* 선반 이미지 = 풀 배경 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="why-shelf-img"
          src="/images/landing/why-shelf.png"
          alt="3D 부품 분해 선반"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center center',
          }}
        />

        {/* "Why," 워터마크 — 가운데 */}
        <div className="why-watermark" style={{
          position: 'absolute', top: '3%', left: '35%', transform: 'translateX(-50%)', zIndex: 2,
          fontSize: 'clamp(110px, 14vw, 200px)',
          fontFamily: "'Inter', sans-serif", fontWeight: 600,
          color: 'rgba(255,255,255,0.20)', lineHeight: 1,
          letterSpacing: 0,
          pointerEvents: 'none', userSelect: 'none',
        }}>Why,</div>

        {/* SIMVEX ? — 상단 영역 */}
        <div className="why-title" style={{
          position: 'absolute', top: '10%', left: 0, right: 0,
          textAlign: 'center', zIndex: 2,
        }}>
          <span style={{
            color: 'white', fontSize: 'clamp(30px, 3.5vw, 50px)',
            fontFamily: 'Righteous', fontWeight: 400,
            letterSpacing: 4,
          }}>SIMVEX ?</span>
        </div>

        {/* 보이지 않던 내부를 — 중앙 영역 */}
        <div className="why-sub1" style={{
          position: 'absolute', top: '36%', left: 0, right: 0,
          textAlign: 'center', zIndex: 2,
        }}>
          <span style={{
            color: 'rgba(255,255,255,0.8)', fontSize: 'clamp(28px, 3.5vw, 50px)',
            fontFamily: "'Gmarket Sans', sans-serif", fontWeight: 300,
            letterSpacing: 0.2, lineHeight: '121%',
          }}>보이지 않던 내부를</span>
        </div>

        {/* 손에 닿는 이해로. — 중앙 하단 */}
        <div className="why-sub2" style={{
          position: 'absolute', top: '44%', left: 0, right: 0,
          textAlign: 'center', zIndex: 2,
        }}>
          <span className="why-sub2-shimmer" style={{
            fontSize: 'clamp(38px, 5vw, 70px)',
            fontFamily: "'Gmarket Sans', sans-serif", fontWeight: 700,
            letterSpacing: 0.2, lineHeight: '121%',
          }}>손에 닿는 이해로.</span>
        </div>

        {/* 하단 경계선 — 다음 섹션과의 직선 전환 */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
          background: '#E0E0E0',
          zIndex: 3, pointerEvents: 'none',
        }} />
      </section>

      {/* ── Feature 섹션 (about) ── */}
      <section id="about" className="landing-features" style={{
        position: 'relative', width: '100%',
        maxWidth: 1300, margin: '0 auto',
        padding: '20px 80px 120px',
        overflow: 'visible',
      }}>
        {/* 곡선 SVG — about → pricing 연결 */}
        <svg
          className="landing-feature-svg"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          fill="none"
          viewBox="0 0 1545 1410"
          preserveAspectRatio="xMidYMid meet"
        >
          <path ref={curveRef} d={CURVE_PATH} stroke="#373737" strokeOpacity="0.3" strokeWidth="4" />
        </svg>

        {/* "about SIMVEX" 타이틀 */}
        <div className="fade-in-up landing-about-title" style={{ display: 'flex', gap: 8, marginBottom: 56 }}>
          <span style={{ color: 'black', fontSize: 30, fontFamily: 'Righteous', fontWeight: 400, lineHeight: '44px' }}>about </span>
          <span style={{ color: '#001AFF', fontSize: 30, fontFamily: 'Righteous', fontWeight: 400, lineHeight: '44px' }}>SIMVEX</span>
        </div>

        {/* Feature 1 — 이미지 왼쪽 · 텍스트 오른쪽 */}
        <div className="fade-in-up landing-feature-row" style={{
          display: 'flex', alignItems: 'center', gap: 48,
          marginBottom: 80,
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="landing-feature-img"
            style={{ width: '46%', maxWidth: 500, borderRadius: 14, objectFit: 'cover', flexShrink: 0, position: 'relative', zIndex: 1, marginLeft: -60 }}
            src="/images/landing/feature-explode.png" alt="3D 모델 분해도" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="landing-feature-number" style={{ position: 'absolute', left: -40, top: -110, opacity: 0.07, fontSize: 240, fontFamily: 'Anta', fontWeight: 400, lineHeight: 1, color: '#000', pointerEvents: 'none', zIndex: -1 }}>1</div>
            <div className="landing-feature-title" style={{
              color: '#212121', fontSize: 28, fontFamily: 'Inter', fontWeight: 600,
              textTransform: 'capitalize' as const, letterSpacing: 0.2, marginBottom: 16,
            }}>3D모델 조립·분해 기반 학습</div>
            <div style={{ lineHeight: '24px' }}>
              <span style={{ color: '#474747', fontSize: 15, fontFamily: 'Pretendard Variable', fontWeight: 400 }}>SIMVEX는 사용자가 업로드한 </span>
              <span style={{ color: '#0019FF', fontSize: 15, fontFamily: 'Pretendard Variable', fontWeight: 600 }}>3D모델의 조립·분해, 회전·확대·축소 기능을 제공</span>
              <span style={{ color: '#474747', fontSize: 15, fontFamily: 'Pretendard Variable', fontWeight: 400 }}>하며, 부품 간 구조 관계를 시각적으로 확인할 수 있습니다.</span>
            </div>
          </div>
        </div>

        {/* Feature 2 — 이미지 오른쪽 · 텍스트 왼쪽 */}
        <div className="fade-in-up landing-feature-row landing-feature-row-reverse" style={{
          display: 'flex', alignItems: 'center', gap: 40,
          flexDirection: 'row-reverse',
          marginBottom: 64,
          transitionDelay: '0.2s',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="landing-feature-img"
            style={{ width: '46%', maxWidth: 500, borderRadius: 14, objectFit: 'cover', flexShrink: 0, position: 'relative', zIndex: 1 }}
            src="/images/landing/feature-ai.png" alt="AI 부품 설명" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="landing-feature-number" style={{ position: 'absolute', left: -40, top: -110, opacity: 0.07, fontSize: 240, fontFamily: 'Anta', fontWeight: 400, lineHeight: 1, color: '#000', pointerEvents: 'none', zIndex: -1 }}>2</div>
            <div className="landing-feature-title" style={{
              color: '#212121', fontSize: 28, fontFamily: 'Inter', fontWeight: 600,
              textTransform: 'capitalize' as const, letterSpacing: 0.2, marginBottom: 16,
            }}>부품별 실시간 AI 설명 제공</div>
            <div style={{ lineHeight: '24px', maxWidth: 380 }}>
              <span style={{ color: '#3A3A3A', fontSize: 15, fontFamily: 'Pretendard Variable', fontWeight: 400 }}>사용자가 선택한 부품에 대해 </span>
              <span style={{ color: '#001AFF', fontSize: 15, fontFamily: 'Pretendard Variable', fontWeight: 600 }}>AI 기반 전반적인 구조와 기능에 대한 설명을 실시간으로</span>
              <span style={{ color: '#3A3A3A', fontSize: 15, fontFamily: 'Pretendard Variable', fontWeight: 400 }}> 빠르게 제공합니다.</span>
            </div>
          </div>
        </div>

        {/* Feature 3 — 이미지 왼쪽 · 텍스트 오른쪽 */}
        <div className="fade-in-up landing-feature-row" style={{
          display: 'flex', alignItems: 'center', gap: 40,
          transitionDelay: '0.4s',
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="landing-feature-img"
            style={{ width: '46%', maxWidth: 500, borderRadius: 14, objectFit: 'cover', flexShrink: 0, position: 'relative', zIndex: 1, marginLeft: -60 }}
            src="/images/landing/feature-simulation.png" alt="3D 시뮬레이션" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="landing-feature-number" style={{ position: 'absolute', left: -40, top: -140, opacity: 0.07, fontSize: 240, fontFamily: 'Anta', fontWeight: 400, lineHeight: 1, color: '#000', pointerEvents: 'none', zIndex: -1 }}>3</div>
            <div className="landing-feature-title" style={{
              color: '#212121', fontSize: 28, fontFamily: 'Inter', fontWeight: 600,
              textTransform: 'capitalize' as const, letterSpacing: 0.2, marginBottom: 16,
            }}>가상 3D 시뮬레이션</div>
            <div style={{ lineHeight: '24px', maxWidth: 380, color: '#757575', fontSize: 14, fontFamily: 'Inter', fontWeight: 400 }}>
              입력된 3D 모델의 파라미터 조절을 통해 제품의 작동 상태와 변화를 시각적으로 확인합니다.
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing 섹션 ── */}
      <section id="pricing" className="landing-pricing" style={{
        width: '100%', padding: '100px 60px 80px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div className="fade-in-up" style={{
          color: '#001AFF', fontSize: 13, fontFamily: 'DM Sans', fontWeight: 700,
          letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 12,
        }}>PRICING</div>

        <div className="fade-in-up landing-pricing-title" style={{
          color: '#212121', fontSize: 34, fontFamily: 'Pretendard Variable', fontWeight: 800,
          textAlign: 'center', marginBottom: 48, transitionDelay: '0.1s',
        }}>원하는 멤버십을 선택하세요</div>

        <div className="landing-pricing-cards" style={{ display: 'flex', gap: 28, marginBottom: 56, width: '100%', maxWidth: 1200, justifyContent: 'center' }}>
          {[
            {
              name: 'Basic', price: '$99', delay: 0,
              features: ['All analytics features', 'Up to 250,000 tracked visits', 'Normal support', 'Mobile app', 'Up to 3 team members'],
            },
            {
              name: 'Growth', price: '$199', delay: 0.15,
              features: ['Everything on Basic plan', 'Up to 1,000,000 tracked visits', 'Premium support', 'Mobile app', 'Up to 10 team members'],
            },
            {
              name: 'Enterprise', price: '$399', delay: 0.3,
              features: ['Everything on Growth plan', 'Up to 5,000,000 tracked visits', 'Dedicated support', 'Mobile app', 'Up to 50 team members'],
            },
          ].map((plan) => (
            <div key={plan.name} className="fade-in-up pricing-card" style={{
              flex: 1, maxWidth: 380, borderRadius: 16, overflow: 'hidden',
              background: '#fff', border: '1px solid #E5E7EB',
              transitionDelay: `${plan.delay}s`,
            }}>
              <div style={{
                background: '#001AFF', padding: '36px 0 32px', textAlign: 'center',
              }}>
                <div style={{ color: 'white', fontSize: 20, fontFamily: 'DM Sans', fontWeight: 700, marginBottom: 8 }}>{plan.name}</div>
                <div className="landing-pricing-price" style={{ color: 'white', fontSize: 48, fontFamily: 'DM Sans', fontWeight: 800, lineHeight: 1.1 }}>{plan.price}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontFamily: 'DM Sans', marginTop: 6 }}>Billed monthly</div>
              </div>
              <div style={{ padding: '28px 26px 32px' }}>
                {plan.features.map((feat) => (
                  <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
                      <circle cx="10" cy="10" r="10" fill="#001AFF" fillOpacity="0.1" />
                      <path d="M6 10.5L8.5 13L14 7.5" stroke="#001AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ color: '#374151', fontSize: 14, fontFamily: 'DM Sans', fontWeight: 500 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="fade-in-up" style={{ transitionDelay: '0.4s' }}>
          <Link href="/models" className="landing-btn landing-pricing-cta" style={{
            display: 'inline-block', padding: '14px 64px',
            background: '#001AFF', borderRadius: 32, textDecoration: 'none',
            color: 'white', fontSize: 18, fontFamily: 'DM Sans', fontWeight: 700,
          }}>Next</Link>
        </div>
      </section>

      {/* ── 푸터 ── */}
      <footer className="fade-in-up" style={{
        width: '100%', background: '#4A4A4A', color: '#fff',
        fontFamily: 'Pretendard Variable',
      }}>
        <div style={{
          textAlign: 'center', paddingTop: 36, paddingBottom: 24,
          fontSize: 22, fontWeight: 700, fontFamily: 'Inter',
        }}>Contact Us</div>

        <div className="landing-footer-cols" style={{ display: 'flex', justifyContent: 'center', gap: 100, paddingBottom: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Product</div>
            {['3D 뷰어', '모델 업로드', 'AI 어시스턴트', '퀴즈', '시뮬레이션'].map((t) => (
              <span key={t} style={{ color: '#B0B0B0', fontSize: 13 }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Information</div>
            {['사용 가이드', '자주 묻는 질문', 'API 문서'].map((t) => (
              <span key={t} style={{ color: '#B0B0B0', fontSize: 13 }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Company</div>
            {['팀 소개', '연락처', '파트너십', '채용 정보'].map((t) => (
              <span key={t} style={{ color: '#B0B0B0', fontSize: 13 }}>{t}</span>
            ))}
          </div>
        </div>

        <div className="landing-footer-divider" style={{ position: 'relative', height: 32, margin: '0 40px' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '2px dashed #6EB8FF', transform: 'translateY(-50%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#6EB8FF', fontSize: 18, fontWeight: 700, background: '#4A4A4A', padding: '0 8px' }}>&#10005;</div>
        </div>

        <div style={{ textAlign: 'center', padding: '24px 0 36px', fontSize: 22, fontWeight: 700, color: '#ddd' }}>단체사진</div>

        <div style={{ margin: '0 40px', borderTop: '1px solid rgba(255,255,255,0.15)' }} />

        <div className="landing-footer-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px 24px' }}>
          <div style={{ fontSize: 24, fontFamily: 'Righteous', fontWeight: 400 }}>SIMVEX</div>
          <div style={{ display: 'flex', gap: 28 }}>
            {['Terms', 'Privacy', 'Cookies'].map((t) => (
              <span key={t} style={{ fontSize: 13, color: '#ccc', cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ccc"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#ccc"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #888', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
