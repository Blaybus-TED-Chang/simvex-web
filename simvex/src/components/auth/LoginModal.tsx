'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ── 입력 필드 공통 스타일 ── */
const inputClass =
  'w-full px-4 py-3 bg-gray-50/80 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#001AFF] focus:ring-2 focus:ring-[#001AFF]/10 focus:bg-white transition-all duration-200';

/* ── 아이콘 래퍼 ── */
function InputIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      {children}
    </div>
  );
}

/* ── 로그인 폼 ── */
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: name, nickname },
        },
      });
      if (error) setError(error.message);
      else setMessage('확인 이메일을 보냈습니다. 이메일을 확인해주세요.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  const switchTab = (signup: boolean) => {
    setIsSignUp(signup);
    setError(null);
    setMessage(null);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white">
      {/* 상단 장식 바 */}
      <div className="h-1.5 bg-gradient-to-r from-[#001AFF] via-[#4D6AFF] to-[#001AFF]" />

      <div className="px-8 pt-8 pb-9">
        {/* 로고 + 제목 */}
        <div className="text-center mb-7">
          <div className="text-[26px] text-black mb-4" style={{ fontFamily: 'Righteous', fontWeight: 400 }}>VEXA</div>
          <h1 className="text-[22px] font-bold text-gray-900 mb-1.5 tracking-tight">
            {isSignUp ? '새 계정 만들기' : '다시 만나서 반가워요'}
          </h1>
          <p className="text-[13px] text-gray-400">
            {isSignUp ? '정보를 입력하고 간편하게 가입하세요' : 'VEXA에 로그인하고 3D 모델을 탐색하세요'}
          </p>
        </div>

        {/* 탭 전환 */}
        <div className="flex bg-gray-100/80 rounded-xl p-1 mb-6">
          <button type="button" onClick={() => switchTab(false)}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
              !isSignUp
                ? 'bg-white text-[#001AFF] shadow-sm shadow-gray-200/50'
                : 'text-gray-400 hover:text-gray-500'
            }`}>
            로그인
          </button>
          <button type="button" onClick={() => switchTab(true)}
            className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
              isSignUp
                ? 'bg-white text-[#001AFF] shadow-sm shadow-gray-200/50'
                : 'text-gray-400 hover:text-gray-500'
            }`}>
            회원가입
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* 회원가입 전용 필드 */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3" style={{ animation: 'fadeInUp 0.3s ease both' }}>
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">이름</label>
                <div className="relative">
                  <InputIcon>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </InputIcon>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                    className={inputClass + ' pl-10'} placeholder="홍길동" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">닉네임</label>
                <div className="relative">
                  <InputIcon>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </InputIcon>
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} required
                    className={inputClass + ' pl-10'} placeholder="닉네임" />
                </div>
              </div>
            </div>
          )}

          {/* 이메일 */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">이메일</label>
            <div className="relative">
              <InputIcon>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </InputIcon>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className={inputClass + ' pl-10'} placeholder="you@example.com" />
            </div>
          </div>

          {/* 비밀번호 */}
          <div>
            <label className="block text-[12px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">비밀번호</label>
            <div className="relative">
              <InputIcon>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </InputIcon>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className={inputClass + ' pl-10 pr-11'} placeholder="6자 이상" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#001AFF] transition-colors">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
                  }
                </svg>
              </button>
            </div>
          </div>

          {/* 에러 / 성공 메시지 */}
          {error && (
            <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-100 rounded-xl" style={{ animation: 'fadeInUp 0.3s ease both' }}>
              <svg className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[13px] text-red-600 font-medium">{error}</p>
            </div>
          )}
          {message && (
            <div className="flex items-start gap-2.5 p-3 bg-emerald-50 border border-emerald-100 rounded-xl" style={{ animation: 'fadeInUp 0.3s ease both' }}>
              <svg className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[13px] text-emerald-700 font-medium">{message}</p>
            </div>
          )}

          {/* 제출 버튼 */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-[#001AFF] hover:bg-[#0015D4] text-white rounded-xl text-[15px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-[#001AFF]/20 hover:shadow-[#001AFF]/30 active:scale-[0.98]">
            <span className="flex items-center justify-center gap-2">
              {loading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
            </span>
          </button>
        </form>

        {/* 하단 안내 */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <p className="text-center text-[12px] text-gray-400">
            {isSignUp ? (
              <>
                <svg className="inline w-3.5 h-3.5 mr-1 -mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                가입 후 입력한 이메일로 인증 메일이 발송됩니다
              </>
            ) : '아직 계정이 없다면 회원가입 탭을 눌러주세요'}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── 로그인 모달 (공유 컴포넌트) ── */
export function LoginModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease both' }}>
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-[440px] mx-4" style={{ animation: 'scaleIn 0.3s ease both' }}>
        <button onClick={onClose}
          className="absolute -top-2.5 -right-2.5 z-10 w-8 h-8 rounded-full bg-white shadow-lg shadow-gray-300/40 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all duration-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <LoginScreen />
      </div>
    </div>
  );
}
