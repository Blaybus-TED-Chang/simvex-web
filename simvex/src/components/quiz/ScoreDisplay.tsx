'use client';

interface ScoreDisplayProps {
  score: number;
  total: number;
  onRetry: () => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export function ScoreDisplay({
  score,
  total,
  onRetry,
  onClose,
  isDarkMode,
}: ScoreDisplayProps) {
  const percentage = Math.round((score / total) * 100);

  let grade: { label: string; color: string; emoji: string };
  if (percentage >= 90) {
    grade = { label: '우수', color: 'text-green-500', emoji: '' };
  } else if (percentage >= 70) {
    grade = { label: '양호', color: 'text-blue-500', emoji: '' };
  } else if (percentage >= 50) {
    grade = { label: '보통', color: 'text-yellow-500', emoji: '' };
  } else {
    grade = { label: '노력 필요', color: 'text-red-500', emoji: '' };
  }

  return (
    <div className="text-center space-y-6 py-8">
      {/* 점수 원형 표시 */}
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            strokeWidth="12"
            fill="none"
            className={isDarkMode ? 'stroke-gray-700' : 'stroke-gray-200'}
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            className={
              percentage >= 70
                ? 'stroke-green-500'
                : percentage >= 50
                ? 'stroke-yellow-500'
                : 'stroke-red-500'
            }
            strokeDasharray={`${(percentage / 100) * 440} 440`}
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`text-4xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {score}/{total}
          </span>
          <span
            className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {percentage}%
          </span>
        </div>
      </div>

      {/* 등급 */}
      <div className="space-y-2">
        <p className={`text-2xl font-bold ${grade.color}`}>
          {grade.emoji} {grade.label}
        </p>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          {percentage >= 70
            ? '드론 구조를 잘 이해하고 있습니다!'
            : '조금 더 학습이 필요합니다. 다시 도전해보세요!'}
        </p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3 justify-center pt-4">
        <button
          onClick={onRetry}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          다시 풀기
        </button>
        <button
          onClick={onClose}
          className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
            isDarkMode
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
