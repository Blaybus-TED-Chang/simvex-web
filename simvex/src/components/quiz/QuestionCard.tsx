'use client';

import { QuizQuestion } from '@/data/quizzes/types';
import { TTSButton } from '@/components/ui/TTSButton';

interface QuestionCardProps {
  question: QuizQuestion;
  selectedAnswer: string | number | undefined;
  onAnswer: (answer: string | number) => void;
  showResult: boolean;
  isDarkMode: boolean;
  waitingForPartClick?: boolean;
}

export function QuestionCard({
  question,
  selectedAnswer,
  onAnswer,
  showResult,
  isDarkMode,
  waitingForPartClick,
}: QuestionCardProps) {
  const isCorrect =
    selectedAnswer !== undefined && selectedAnswer === question.correctAnswer;

  return (
    <div className="space-y-4">
      {/* 문제 */}
      <div className="flex items-start gap-2">
        <div
          className={`text-lg font-medium flex-1 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          {question.question}
        </div>
        <TTSButton text={question.question} isDarkMode={isDarkMode} />
      </div>

      {/* identify-part 문제인 경우 */}
      {question.type === 'identify-part' && (
        <div
          className={`p-4 rounded-lg border-2 border-dashed ${
            waitingForPartClick
              ? isDarkMode
                ? 'border-blue-400 bg-blue-500/10'
                : 'border-blue-500 bg-blue-50'
              : showResult
              ? isCorrect
                ? isDarkMode
                  ? 'border-green-400 bg-green-500/10'
                  : 'border-green-500 bg-green-50'
                : isDarkMode
                ? 'border-red-400 bg-red-500/10'
                : 'border-red-500 bg-red-50'
              : isDarkMode
              ? 'border-gray-600 bg-gray-800/50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <svg
              className={`w-6 h-6 ${
                waitingForPartClick
                  ? 'text-blue-500 animate-pulse'
                  : showResult
                  ? isCorrect
                    ? 'text-green-500'
                    : 'text-red-500'
                  : isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
            <span
              className={
                waitingForPartClick
                  ? isDarkMode
                    ? 'text-blue-300'
                    : 'text-blue-700'
                  : isDarkMode
                  ? 'text-gray-300'
                  : 'text-gray-600'
              }
            >
              {waitingForPartClick
                ? '3D 모델에서 해당 부품을 클릭하세요'
                : showResult
                ? isCorrect
                  ? '정답입니다!'
                  : '틀렸습니다. 다시 확인해보세요.'
                : '위 3D 모델에서 부품을 클릭하세요'}
            </span>
          </div>
        </div>
      )}

      {/* 객관식 / O/X 선택지 */}
      {question.options && question.type !== 'identify-part' && (
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrectOption = question.correctAnswer === index;

            let buttonStyle = isDarkMode
              ? 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-800';

            if (showResult) {
              if (isCorrectOption) {
                buttonStyle = isDarkMode
                  ? 'bg-green-900/50 border-green-500 text-green-300'
                  : 'bg-green-50 border-green-500 text-green-700';
              } else if (isSelected && !isCorrectOption) {
                buttonStyle = isDarkMode
                  ? 'bg-red-900/50 border-red-500 text-red-300'
                  : 'bg-red-50 border-red-500 text-red-700';
              }
            } else if (isSelected) {
              buttonStyle = isDarkMode
                ? 'bg-blue-900/50 border-blue-500 text-blue-300'
                : 'bg-blue-50 border-blue-500 text-blue-700';
            }

            return (
              <button
                key={index}
                onClick={() => !showResult && onAnswer(index)}
                disabled={showResult}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${buttonStyle} ${
                  showResult ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                      showResult && isCorrectOption
                        ? isDarkMode
                          ? 'bg-green-500 text-white'
                          : 'bg-green-500 text-white'
                        : showResult && isSelected && !isCorrectOption
                        ? isDarkMode
                          ? 'bg-red-500 text-white'
                          : 'bg-red-500 text-white'
                        : isSelected
                        ? isDarkMode
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {question.type === 'true-false'
                      ? option
                      : String.fromCharCode(65 + index)}
                  </span>
                  <span>{question.type === 'true-false' ? '' : option}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 정답 해설 */}
      {showResult && (
        <div
          className={`mt-4 p-4 rounded-lg ${
            isCorrect
              ? isDarkMode
                ? 'bg-green-900/30 border border-green-700'
                : 'bg-green-50 border border-green-200'
              : isDarkMode
              ? 'bg-orange-900/30 border border-orange-700'
              : 'bg-orange-50 border border-orange-200'
          }`}
        >
          <div className="flex items-start gap-2">
            <svg
              className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                isCorrect
                  ? 'text-green-500'
                  : isDarkMode
                  ? 'text-orange-400'
                  : 'text-orange-500'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p
                className={`font-medium ${
                  isCorrect
                    ? isDarkMode
                      ? 'text-green-300'
                      : 'text-green-700'
                    : isDarkMode
                    ? 'text-orange-300'
                    : 'text-orange-700'
                }`}
              >
                {isCorrect ? '정답!' : '오답'}
              </p>
              <p
                className={`mt-1 text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
