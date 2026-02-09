import Link from 'next/link';

const CURVE_PATH =
  'M0.0338419 2.34804C246.347 -1.82041 749.414 29.7598 791.178 189.428C832.942 349.096 646.763 532.408 548.453 604.106C398.835 714.319 237.915 965.46 791.178 1088.31C1344.44 1211.17 1522.94 1349.59 1543.03 1403.45L1471.45 1487.98L1377.81 1526';

export default function LandingPage() {
  return (
    <div style={{ background: '#F8FAFF', overflow: 'hidden', minHeight: '100vh' }}>
      <div style={{ width: 1440, margin: '0 auto', position: 'relative', minHeight: 2700 }}>

        {/* ── 헤더 ── */}
        <div style={{ width: 1440, height: 118, left: 0, top: 12, position: 'absolute' }}>
          {/* SIMVEX 로고 */}
          <div style={{
            left: 60, top: 32, position: 'absolute',
            color: 'black', fontSize: 35, fontFamily: 'Righteous', fontWeight: 400,
            lineHeight: '64px',
          }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>SIMVEX</Link>
          </div>
          {/* 네비게이션 */}
          <div style={{
            width: 251, paddingLeft: 25, left: 1079, top: 32, position: 'absolute',
            justifyContent: 'flex-end', alignItems: 'center', gap: 24, display: 'inline-flex',
          }}>
            <div style={{ justifyContent: 'flex-end', alignItems: 'center', gap: 33, display: 'flex' }}>
              <Link href="/models" style={{
                textAlign: 'center', color: '#5D5A88', fontSize: 18,
                fontFamily: 'DM Sans', fontWeight: 400, lineHeight: '18px',
                textDecoration: 'none',
              }}>Models</Link>
              <Link href="/community" style={{
                textAlign: 'center', color: '#5D5A88', fontSize: 18,
                fontFamily: 'DM Sans', fontWeight: 400, lineHeight: '18px',
                textDecoration: 'none',
              }}>Community</Link>
            </div>
            <Link href="/auth/login" style={{
              paddingLeft: 24, paddingRight: 24, paddingTop: 18, paddingBottom: 18,
              background: 'white', borderRadius: 30,
              justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex',
              textAlign: 'center', color: '#5D5A88', fontSize: 16,
              fontFamily: 'DM Sans', fontWeight: 400, lineHeight: '18px',
              textDecoration: 'none',
            }}>Login</Link>
            <Link href="/models" style={{
              paddingLeft: 24, paddingRight: 24, paddingTop: 18, paddingBottom: 18,
              background: '#001AFF', borderRadius: 30,
              justifyContent: 'flex-end', alignItems: 'center', gap: 8, display: 'flex',
              textAlign: 'center', color: 'white', fontSize: 16,
              fontFamily: 'DM Sans', fontWeight: 700, lineHeight: '18px',
              textDecoration: 'none',
            }}>Get started</Link>
          </div>
        </div>

        {/* ── 히어로: 파란 원 (2개 겹침) ── */}
        <div style={{
          width: 504, height: 504, left: 468, top: 169, position: 'absolute',
          background: '#0019FF', boxShadow: '0px 0px 40.4px rgba(0,0,0,0.07)', borderRadius: 9999,
        }} />
        <div style={{
          width: 504, height: 504, left: 468, top: 169, position: 'absolute',
          background: '#0019FF', boxShadow: '0px 0px 40.4px rgba(0,0,0,0.07)', borderRadius: 9999,
        }} />

        {/* ── 히어로: SIMVEX 텍스트 (파란색, 원 바깥) ── */}
        <div style={{
          width: 896, height: 261, left: 272, top: 290, position: 'absolute',
          textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column',
          color: '#0019FF', fontSize: 175, fontFamily: 'Righteous', fontWeight: 400,
          lineHeight: '64px',
        }}>SIMVEX</div>

        {/* ── 히어로: SIMVEX 텍스트 (흰색, 원 위) ── */}
        <div style={{
          width: 896, height: 261, left: 272, top: 290, position: 'absolute',
          textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column',
          color: 'white', fontSize: 175, fontFamily: 'Righteous', fontWeight: 400,
          lineHeight: '64px',
          clipPath: 'circle(252px at 448px 131px)',
        }}>SIMVEX</div>

        {/* ── 히어로: 캐치프레이즈 ── */}
        <div style={{
          width: 515, height: 28, left: 463, top: 302, position: 'absolute',
          textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column',
        }}>
          <span style={{ color: 'white', fontSize: 20, fontFamily: 'Roboto', fontWeight: 100, lineHeight: '18px' }}>
            아무리 크고 복잡한 기계도 내 손에서
          </span>
          <span style={{ color: 'white', fontSize: 20, fontFamily: 'Roboto', fontWeight: 500, lineHeight: '18px' }}> </span>
          <span style={{ color: 'white', fontSize: 25, fontFamily: 'Roboto', fontWeight: 900, lineHeight: '18px' }}>슥</span>
        </div>

        {/* ── 구분선 ── */}
        <div style={{
          width: 1444, height: 0, left: -2, top: 427, position: 'absolute',
          borderTop: '2px solid rgba(55,55,55,0.4)',
        }} />

        {/* ── Feature 섹션 (CenterContent) ── */}
        <div style={{ width: 1440, height: 1449, left: 0, top: 1190, position: 'absolute' }}>

          {/* 곡선 SVG */}
          <svg
            style={{ width: 1543, height: 1524, left: 0, top: 155, position: 'absolute' }}
            fill="none"
            viewBox="0 0 1545.32 1527.85"
            preserveAspectRatio="none"
          >
            <path d={CURVE_PATH} stroke="#373737" strokeOpacity="0.3" strokeWidth="4" />
          </svg>

          {/* "about SIMVEX" 타이틀 */}
          <div style={{
            width: 230, height: 41, left: 228, top: 67, position: 'absolute',
            textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column',
          }}>
            <span style={{ color: 'black', fontSize: 35, fontFamily: 'Righteous', fontWeight: 400, lineHeight: '64px' }}>about </span>
            <span style={{ color: '#001AFF', fontSize: 35, fontFamily: 'Righteous', fontWeight: 400, lineHeight: '64px' }}>SIMVEX</span>
          </div>

          {/* Feature 컨테이너 */}
          <div style={{ width: 980, height: 1235, left: 230, top: 134, position: 'absolute' }}>

            {/* ── Feature 1: 3D모델 조립·분해 ── */}
            <div style={{ width: 980, height: 369, left: 0, top: 0, position: 'absolute' }}>
              <div style={{ width: 519, height: 148, left: 551, top: 90, position: 'absolute' }}>
                <div style={{
                  width: 519, left: 0, top: 0, position: 'absolute',
                  justifyContent: 'center', display: 'flex', flexDirection: 'column',
                  color: '#212121', fontSize: 36, fontFamily: 'Inter', fontWeight: 600,
                  textTransform: 'capitalize' as const, letterSpacing: 0.2,
                }}>3D모델 조립·분해 기반 학습</div>
                <div style={{
                  width: 519, left: 0, top: 76, position: 'absolute',
                  justifyContent: 'center', display: 'flex', flexDirection: 'column',
                }}>
                  <span style={{ color: '#474747', fontSize: 18, fontFamily: 'Pretendard Variable', fontWeight: 400, lineHeight: '24px', letterSpacing: 0.2 }}>SIMVEX는 사용자가 업로드한 </span>
                  <span style={{ color: '#0019FF', fontSize: 18, fontFamily: 'Pretendard Variable', fontWeight: 600, lineHeight: '24px', letterSpacing: 0.2 }}>3D모델의 조립·분해, <br />회전·확대·축소 기능을 제공</span>
                  <span style={{ color: '#474747', fontSize: 18, fontFamily: 'Pretendard Variable', fontWeight: 400, lineHeight: '24px', letterSpacing: 0.2 }}>하며, 부품 간 구조 관계를<br />시각적으로 확인할 수 있습니다.</span>
                </div>
              </div>
              <div style={{
                width: 115, height: 155, left: 486, top: 37, position: 'absolute',
                opacity: 0.2, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column',
                color: 'rgba(0,0,0,0.34)', fontSize: 250, fontFamily: 'Anta', fontWeight: 400, lineHeight: '64px',
              }}>1</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img style={{ width: 486, height: 340, left: 0, top: 15, position: 'absolute', borderRadius: 16, objectFit: 'cover' }}
                src="/images/landing/feature-explode.png" alt="3D 모델 분해도" />
            </div>

            {/* ── Feature 2: AI 설명 ── */}
            <div style={{ width: 980, height: 369, left: 0, top: 433, position: 'absolute' }}>
              <div style={{
                left: 0, top: 93.5, position: 'absolute',
                flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start',
                gap: 32, display: 'inline-flex',
              }}>
                <div style={{
                  alignSelf: 'stretch', justifyContent: 'center', display: 'flex', flexDirection: 'column',
                  color: '#212121', fontSize: 36, fontFamily: 'Inter', fontWeight: 600,
                  textTransform: 'capitalize' as const, letterSpacing: 0.2,
                }}>부품별 실시간 AI 설명 제공</div>
                <div style={{
                  width: 429, justifyContent: 'center', display: 'flex', flexDirection: 'column',
                }}>
                  <span style={{ color: '#3A3A3A', fontSize: 18, fontFamily: 'Pretendard Variable', fontWeight: 400, lineHeight: '24px', letterSpacing: 0.2 }}>사용자가 선택한 부품에 대해 </span>
                  <span style={{ color: '#001AFF', fontSize: 18, fontFamily: 'Pretendard Variable', fontWeight: 600, lineHeight: '24px', letterSpacing: 0.2 }}>AI 기반 전반적인 구조와 기능에 대한 설명을 실시간으로</span>
                  <span style={{ color: '#3A3A3A', fontSize: 18, fontFamily: 'Pretendard Variable', fontWeight: 400, lineHeight: '24px', letterSpacing: 0.2 }}> 빠르게 제공합니다.</span>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img style={{ width: 486, height: 331, left: 494, top: 19, position: 'absolute', borderRadius: 16, objectFit: 'cover' }}
                src="/images/landing/feature-ai.png" alt="AI 부품 설명" />
              <div style={{
                width: 115, height: 155, left: -26, top: 36, position: 'absolute',
                opacity: 0.2, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column',
                color: 'rgba(0,0,0,0.34)', fontSize: 250, fontFamily: 'Anta', fontWeight: 400, lineHeight: '64px',
              }}>2</div>
            </div>

            {/* ── Feature 3: 시뮬레이션 ── */}
            <div style={{ width: 980, height: 369, left: 0, top: 866, position: 'absolute' }}>
              <div style={{ width: 429, height: 236, left: 551, top: 66.5, position: 'absolute' }}>
                <div style={{
                  width: 429, left: 0, top: 65, position: 'absolute',
                  justifyContent: 'center', display: 'flex', flexDirection: 'column',
                  color: '#212121', fontSize: 36, fontFamily: 'Inter', fontWeight: 600,
                  textTransform: 'capitalize' as const, letterSpacing: 0.2,
                }}>가상 3D 시뮬레이션</div>
                <div style={{
                  width: 429, left: 0, top: 139.5, position: 'absolute',
                  justifyContent: 'center', display: 'flex', flexDirection: 'column',
                  color: '#757575', fontSize: 18, fontFamily: 'Inter', fontWeight: 400,
                  lineHeight: '24px', letterSpacing: 0.2,
                }}>입력된 3D 모델의 파라미터 조절을 통해 제품의 작동 상태와 변화를 시각적으로 확인합니다.</div>
                <div style={{
                  width: 115, height: 155, left: -37, top: -36.5, position: 'absolute',
                  opacity: 0.2, textAlign: 'center', justifyContent: 'center', display: 'flex', flexDirection: 'column',
                  color: 'rgba(0,0,0,0.34)', fontSize: 250, fontFamily: 'Anta', fontWeight: 400, lineHeight: '64px',
                }}>3</div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img style={{ width: 480, height: 328, left: 0, top: 21, position: 'absolute', borderRadius: 16, objectFit: 'cover' }}
                src="/images/landing/feature-simulation.png" alt="3D 시뮬레이션" />
            </div>

          </div>
        </div>

        {/* ── 푸터 ── */}
        <div style={{
          position: 'absolute', left: 0, top: 2650, width: 1440,
          borderTop: '1px solid rgba(55,55,55,0.2)',
          padding: '32px 60px', display: 'flex', justifyContent: 'space-between',
          color: '#757575', fontSize: 14, fontFamily: 'Pretendard Variable',
        }}>
          <span>SIMVEX - 공학 학습 플랫폼</span>
          <span>교육과 탐구를 위해 만들어졌습니다</span>
        </div>
      </div>
    </div>
  );
}
