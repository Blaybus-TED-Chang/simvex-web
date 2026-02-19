'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { ModelQuiz, QuizQuestion } from '@/data/quizzes/types';
import { useQuizStore } from '@/lib/store/quizStore';
import { QuestionCard } from './QuestionCard';
import { ScoreDisplay } from './ScoreDisplay';

interface ModelInfo {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  theory: string;
  category: string;
  parts: { id: string; name: string; nameKo: string; description: string }[];
}

interface QuizPanelProps {
  quiz?: ModelQuiz;
  modelId: string;
  isDarkMode: boolean;
  onClose: () => void;
  // 부품 클릭 문제용 콜백
  selectedPartId: string | null;
  onRequestPartSelect: (questionPartId: string) => void;
  onClearPartSelect: () => void;
  // AI 퀴즈 생성용
  modelInfo?: ModelInfo | null;
}

export function QuizPanel({
  quiz: propQuiz,
  modelId,
  isDarkMode,
  onClose,
  selectedPartId,
  onRequestPartSelect,
  onClearPartSelect,
  modelInfo,
}: QuizPanelProps) {
  // AI 퀴즈 생성 상태
  const [aiQuiz, setAiQuiz] = useState<ModelQuiz | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // localStorage 캐시에서 AI 퀴즈 복원
  useEffect(() => {
    if (propQuiz) return; // 내장 퀴즈가 있으면 AI 퀴즈 불필요
    try {
      const cached = localStorage.getItem(`ai-quiz-${modelId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setAiQuiz(parsed);
      }
    } catch { /* ignore */ }
  }, [modelId, propQuiz]);

  const quiz = propQuiz || aiQuiz;

  // AI 퀴즈 생성
  const handleGenerateAIQuiz = useCallback(async () => {
    if (!modelInfo) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelName: modelInfo.name,
          modelNameKo: modelInfo.nameKo,
          modelDescription: modelInfo.description,
          modelTheory: modelInfo.theory,
          parts: modelInfo.parts.map((p) => ({
            id: p.id,
            name: p.name,
            nameKo: p.nameKo,
            description: p.description,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '퀴즈 생성 실패');

      const generatedQuiz: ModelQuiz = {
        modelId,
        titleKo: `${modelInfo.nameKo} AI 퀴즈`,
        description: `AI가 생성한 ${modelInfo.nameKo} 학습 퀴즈입니다.`,
        questions: data.questions,
      };
      setAiQuiz(generatedQuiz);
      localStorage.setItem(`ai-quiz-${modelId}`, JSON.stringify(generatedQuiz));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : '퀴즈 생성 실패');
    } finally {
      setAiLoading(false);
    }
  }, [modelId, modelInfo]);
  const {
    quizProgress,
    startQuiz,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    completeQuiz,
    resetQuiz,
  } = useQuizStore();

  // Zustand hydration
  useEffect(() => {
    useQuizStore.persist.rehydrate();
  }, []);

  const progress = quizProgress[modelId];
  const [showResult, setShowResult] = useState(false);
  const [waitingForPartClick, setWaitingForPartClick] = useState(false);

  // 이전 selectedPartId를 추적하여 새로운 클릭만 감지
  const prevSelectedPartIdRef = useRef<string | null>(null);

  // 선택된 문제들을 ID로 매핑
  const selectedQuestions: QuizQuestion[] = progress?.selectedQuestionIds && quiz
    ? progress.selectedQuestionIds
        .map((id) => quiz.questions.find((q) => q.id === id))
        .filter((q): q is QuizQuestion => q !== undefined)
    : [];

  const currentQuestion: QuizQuestion | undefined = progress
    ? selectedQuestions[progress.currentIndex]
    : undefined;

  // 현재 문제에 이미 답변했는지 확인
  const hasAnsweredCurrent = currentQuestion
    ? progress?.answers[currentQuestion.id] !== undefined
    : false;

  // 퀴즈 시작 (30개 중 10개 랜덤 선택)
  const handleStart = useCallback(() => {
    if (!quiz) return;
    const allQuestionIds = quiz.questions.map((q) => q.id);
    startQuiz(modelId, allQuestionIds, 10);
    setShowResult(false);
    setWaitingForPartClick(false);
    onClearPartSelect();
    prevSelectedPartIdRef.current = null;
  }, [modelId, quiz, startQuiz, onClearPartSelect]);

  // 답변 선택 (객관식, O/X)
  const handleAnswer = useCallback(
    (answer: string | number) => {
      if (!currentQuestion || !progress) return;

      const isCorrect = answer === currentQuestion.correctAnswer;
      answerQuestion(modelId, currentQuestion.id, answer, isCorrect);
      setShowResult(true);
      setWaitingForPartClick(false);
    },
    [modelId, currentQuestion, progress, answerQuestion]
  );

  // identify-part 문제에서 부품 선택 처리
  useEffect(() => {
    // 조건: 클릭 대기 중이고, identify-part 문제이고, 아직 답변 안 함
    if (
      !waitingForPartClick ||
      currentQuestion?.type !== 'identify-part' ||
      !selectedPartId ||
      showResult // 이미 결과 표시 중이면 무시
    ) {
      return;
    }

    // 같은 부품을 다시 클릭한 경우 무시
    if (selectedPartId === prevSelectedPartIdRef.current) {
      return;
    }
    prevSelectedPartIdRef.current = selectedPartId;

    // 정답 판정: 같은 종류의 부품이면 정답 (blade-1, blade-2 등)
    const correctPartId = currentQuestion.partId || '';
    const correctPartBase = correctPartId.replace(/-\d+$/, '');
    const selectedPartBase = selectedPartId.replace(/-\d+$/, '');

    const isCorrect = correctPartBase === selectedPartBase;

    answerQuestion(modelId, currentQuestion.id, selectedPartId, isCorrect);
    setShowResult(true);
    setWaitingForPartClick(false);
  }, [
    selectedPartId,
    waitingForPartClick,
    currentQuestion,
    modelId,
    answerQuestion,
    showResult,
  ]);

  // 다음 문제
  const handleNext = useCallback(() => {
    if (!progress) return;

    if (progress.currentIndex >= selectedQuestions.length - 1) {
      completeQuiz(modelId);
    } else {
      nextQuestion(modelId);
      setShowResult(false);
      onClearPartSelect();
      prevSelectedPartIdRef.current = null;

      // 다음 문제가 identify-part인 경우
      const nextQ = selectedQuestions[progress.currentIndex + 1];
      if (nextQ?.type === 'identify-part' && nextQ.partId) {
        setWaitingForPartClick(true);
        onRequestPartSelect(nextQ.partId);
      }
    }
  }, [
    progress,
    selectedQuestions,
    modelId,
    completeQuiz,
    nextQuestion,
    onClearPartSelect,
    onRequestPartSelect,
  ]);

  // 이전 문제
  const handlePrev = useCallback(() => {
    if (!progress || progress.currentIndex <= 0) return;

    prevQuestion(modelId);
    onClearPartSelect();
    prevSelectedPartIdRef.current = null;

    // 이전 문제의 답변 여부에 따라 결과 표시
    const prevQ = selectedQuestions[progress.currentIndex - 1];
    const hasPrevAnswer = progress.answers[prevQ.id] !== undefined;
    setShowResult(hasPrevAnswer);

    // 이전 문제가 identify-part이고 아직 답변 안 했으면 클릭 대기
    if (prevQ?.type === 'identify-part' && !hasPrevAnswer && prevQ.partId) {
      setWaitingForPartClick(true);
      onRequestPartSelect(prevQ.partId);
    } else {
      setWaitingForPartClick(false);
    }
  }, [
    progress,
    selectedQuestions,
    modelId,
    prevQuestion,
    onClearPartSelect,
    onRequestPartSelect,
  ]);

  // 다시 풀기
  const handleRetry = useCallback(() => {
    resetQuiz(modelId);
    handleStart();
  }, [modelId, resetQuiz, handleStart]);

  // identify-part 문제 시작 시 클릭 대기 모드
  useEffect(() => {
    if (
      currentQuestion?.type === 'identify-part' &&
      !showResult &&
      progress &&
      !hasAnsweredCurrent
    ) {
      setWaitingForPartClick(true);
      if (currentQuestion.partId) {
        onRequestPartSelect(currentQuestion.partId);
      }
    } else if (currentQuestion?.type !== 'identify-part') {
      setWaitingForPartClick(false);
    }
  }, [currentQuestion, showResult, progress, hasAnsweredCurrent, onRequestPartSelect]);

  // 문제 인덱스 변경 시 상태 동기화
  useEffect(() => {
    if (!progress || !currentQuestion) return;

    const hasAnswer = progress.answers[currentQuestion.id] !== undefined;
    setShowResult(hasAnswer);

    if (currentQuestion.type === 'identify-part' && !hasAnswer) {
      setWaitingForPartClick(true);
      prevSelectedPartIdRef.current = null;
    }
  }, [progress?.currentIndex]);

  return (
    <div
      className={`h-full flex flex-col ${
        isDarkMode ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      {/* 헤더 */}
      <div
        className={`p-4 border-b ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2
            className={`text-lg font-semibold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {quiz?.titleKo || '퀴즈'}
          </h2>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDarkMode
                ? 'hover:bg-gray-800 text-gray-400'
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {progress && !progress.completed && (
          <div className="mt-3">
            {/* 진행률 바 및 문제 번호 클릭 */}
            <div className="flex gap-1 mb-2">
              {selectedQuestions.map((q, idx) => {
                const isAnswered = progress.answers[q.id] !== undefined;
                const isCurrent = idx === progress.currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      if (idx !== progress.currentIndex) {
                        useQuizStore.getState().goToQuestion(modelId, idx);
                        onClearPartSelect();
                        prevSelectedPartIdRef.current = null;
                        const targetQ = selectedQuestions[idx];
                        const hasTargetAnswer = progress.answers[targetQ.id] !== undefined;
                        setShowResult(hasTargetAnswer);
                        if (targetQ.type === 'identify-part' && !hasTargetAnswer && targetQ.partId) {
                          setWaitingForPartClick(true);
                          onRequestPartSelect(targetQ.partId);
                        } else {
                          setWaitingForPartClick(false);
                        }
                      }
                    }}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      isCurrent
                        ? 'bg-blue-500'
                        : isAnswered
                        ? progress.correctAnswers[q.id]
                          ? isDarkMode
                            ? 'bg-green-600'
                            : 'bg-green-500'
                          : isDarkMode
                            ? 'bg-red-600'
                            : 'bg-red-500'
                        : isDarkMode
                        ? 'bg-gray-700 hover:bg-gray-600'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    title={`${idx + 1}번 문제`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {progress.currentIndex + 1} / {selectedQuestions.length} 문제
              </p>
              <button
                onClick={handleRetry}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isDarkMode
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title="퀴즈 초기화"
              >
                다시 풀기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* 퀴즈 없음: AI 생성 화면 */}
        {!quiz && (
          <div className="text-center py-12 space-y-6">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}
            >
              <svg
                className={`w-10 h-10 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI 퀴즈 생성
              </h3>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                이 모델에 대한 퀴즈가 없습니다.<br />AI가 자동으로 퀴즈를 생성합니다.
              </p>
            </div>
            {aiError && (
              <p className="text-red-500 text-sm">{aiError}</p>
            )}
            <button
              onClick={handleGenerateAIQuiz}
              disabled={aiLoading || !modelInfo}
              className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto ${
                aiLoading
                  ? isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                  : isDarkMode
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {aiLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI 퀴즈 생성
                </>
              )}
            </button>
          </div>
        )}

        {/* 시작 화면 */}
        {quiz && !progress && (
          <div className="text-center py-12 space-y-6">
            <div
              className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}
            >
              <svg
                className={`w-10 h-10 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-500'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {quiz.titleKo}
              </h3>
              <p
                className={`mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {quiz.description}
              </p>
              <p
                className={`mt-1 text-sm ${
                  isDarkMode ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                {quiz.questions.length}문제 중 10문제 랜덤 출제
              </p>
            </div>
            <button
              onClick={handleStart}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              퀴즈 시작
            </button>
          </div>
        )}

        {/* 퀴즈 진행 중 */}
        {quiz && progress && !progress.completed && currentQuestion && (
          <div className="space-y-6">
            <QuestionCard
              question={currentQuestion}
              selectedAnswer={progress.answers[currentQuestion.id]}
              onAnswer={handleAnswer}
              showResult={showResult}
              isDarkMode={isDarkMode}
              waitingForPartClick={waitingForPartClick && !showResult}
            />

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between items-center">
              {/* 이전 버튼 */}
              <button
                onClick={handlePrev}
                disabled={progress.currentIndex <= 0}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  progress.currentIndex <= 0
                    ? isDarkMode
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDarkMode
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                이전
              </button>

              {/* 다음/결과 버튼 */}
              {showResult && (
                <button
                  onClick={handleNext}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  {progress.currentIndex >= selectedQuestions.length - 1
                    ? '결과 보기'
                    : '다음'}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 완료 화면 */}
        {progress?.completed && (
          <ScoreDisplay
            score={progress.score}
            total={selectedQuestions.length}
            questions={selectedQuestions}
            answers={progress.answers}
            correctAnswers={progress.correctAnswers}
            onRetry={handleRetry}
            onClose={onClose}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </div>
  );
}
