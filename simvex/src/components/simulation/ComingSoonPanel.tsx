'use client';

interface ComingSoonPanelProps {
  isDarkMode: boolean;
}

export default function ComingSoonPanel({ isDarkMode }: ComingSoonPanelProps) {
  return (
    <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
      <div className="text-center">
        <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <svg className={`w-10 h-10 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          준비 중
        </h3>
        <p className={`text-sm max-w-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          이 모델의 시뮬레이션은 아직 준비 중입니다.
          <br />곧 업데이트될 예정입니다.
        </p>
      </div>
    </div>
  );
}
