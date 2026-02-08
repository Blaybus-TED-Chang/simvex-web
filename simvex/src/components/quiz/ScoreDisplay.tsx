'use client';

import { useState } from 'react';
import { QuizQuestion } from '@/data/quizzes/types';

interface ScoreDisplayProps {
  score: number;
  total: number;
  questions: QuizQuestion[];
  answers: Record<string, string | number>;
  correctAnswers: Record<string, boolean>;
  onRetry: () => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export function ScoreDisplay({
  score,
  total,
  questions,
  answers,
  correctAnswers,
  onRetry,
  onClose,
  isDarkMode,
}: ScoreDisplayProps) {
  const percentage = Math.round((score / total) * 100);
  const [showWrongAnswers, setShowWrongAnswers] = useState(false);

  const wrongQuestions = questions.filter((q) => correctAnswers[q.id] === false);

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

  function getAnswerLabel(q: QuizQuestion, answer: string | number): string {
    if (q.type === 'true-false') {
      return answer === 0 ? 'O (참)' : 'X (거짓)';
    }
    if (q.type === 'multiple-choice' && q.options && typeof answer === 'number') {
      return q.options[answer] || String(answer);
    }
    if (q.type === 'identify-part') {
      return String(answer);
    }
    return String(answer);
  }

  function getCorrectLabel(q: QuizQuestion): string {
    if (q.type === 'true-false') {
      return q.correctAnswer === 0 ? 'O (참)' : 'X (거짓)';
    }
    if (q.type === 'multiple-choice' && q.options && typeof q.correctAnswer === 'number') {
      return q.options[q.correctAnswer] || String(q.correctAnswer);
    }
    if (q.type === 'identify-part') {
      return q.partId || String(q.correctAnswer);
    }
    return String(q.correctAnswer);
  }

  return (
    <div className="space-y-6 py-8">
      {/* 점수 원형 표시 */}
      <div className="text-center">
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
        <div className="space-y-2 mt-4">
          <p className={`text-2xl font-bold ${grade.color}`}>
            {grade.emoji} {grade.label}
          </p>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {percentage >= 70
              ? '구조를 잘 이해하고 있습니다!'
              : '조금 더 학습이 필요합니다. 다시 도전해보세요!'}
          </p>
        </div>
      </div>

      {/* 오답노트 토글 버튼 */}
      {wrongQuestions.length > 0 && (
        <div>
          <button
            onClick={() => setShowWrongAnswers(!showWrongAnswers)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors ${
              isDarkMode
                ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                : 'bg-red-50 hover:bg-red-100 text-red-600'
            }`}
          >
            <span>
              오답노트 ({wrongQuestions.length}문제)
            </span>
            <svg
              className={`w-5 h-5 transition-transform ${showWrongAnswers ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 오답 목록 */}
          {showWrongAnswers && (
            <div className="mt-3 space-y-3">
              {wrongQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`rounded-lg p-4 ${
                    isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                      isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
                    }`}>
                      오답
                    </span>
                    <p className={`text-sm font-medium flex-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {q.question}
                    </p>
                  </div>

                  <div className="ml-8 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className={`text-xs mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
                        내 답: {getAnswerLabel(q, answers[q.id])}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className={`text-xs mt-0.5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        정답: {getCorrectLabel(q)}
                      </span>
                    </div>
                    {q.explanation && (
                      <p className={`text-xs mt-1.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 전체 정답이면 축하 메시지 */}
      {wrongQuestions.length === 0 && (
        <div className={`text-center py-3 rounded-lg ${
          isDarkMode ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'
        }`}>
          <p className="font-medium">모든 문제를 맞혔습니다!</p>
        </div>
      )}

      {/* 버튼 */}
      <div className="flex gap-3 justify-center pt-2">
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
