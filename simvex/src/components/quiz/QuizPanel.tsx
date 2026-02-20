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

type DifficultyLevel = 'mixed' | 'easy' | 'medium' | 'hard';

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
  chatHistory?: string;
  notesContent?: string;
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
  chatHistory,
  notesContent,
}: QuizPanelProps) {
  // AI 퀴즈 생성 상태
  const [aiQuiz, setAiQuiz] = useState<ModelQuiz | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState<DifficultyLevel>('mixed');
  // 현재 사용 중인 퀴즈 소스: 'builtin' | 'ai'
  const [quizSource, setQuizSource] = useState<'builtin' | 'ai'>('builtin');

  const {
    quizProgress,
    startQuiz,
    answerQuestion,
    nextQuestion,
    prevQuestion,
    completeQuiz,
    resetQuiz,
  } = useQuizStore();

  // localStorage 캐시에서 AI 퀴즈 복원
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`ai-quiz-${modelId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setAiQuiz(parsed);
      }
    } catch { /* ignore */ }
  }, [modelId]);

  // 내장 퀴즈가 없으면 AI 소스로 시작
  useEffect(() => {
    if (!propQuiz) {
      setQuizSource('ai');
    }
  }, [propQuiz]);

  const quiz = quizSource === 'ai' && aiQuiz ? aiQuiz : propQuiz || aiQuiz;

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
          difficulty: aiDifficulty,
          chatHistory: chatHistory || undefined,
          notesContent: notesContent || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '퀴즈 생성 실패');

      const diffLabel = aiDifficulty === 'mixed' ? '' : ` (${
        aiDifficulty === 'easy' ? '쉬움' : aiDifficulty === 'medium' ? '보통' : '어려움'
      })`;
      const generatedQuiz: ModelQuiz = {
        modelId,
        titleKo: `${modelInfo.nameKo} AI 맞춤 퀴즈${diffLabel}`,
        description: `AI가 학습 상태를 분석하여 생성한 맞춤 퀴즈입니다.`,
        questions: data.questions,
      };
      setAiQuiz(generatedQuiz);
      setQuizSource('ai');
      // 기존 진행 상태 초기화
      resetQuiz(modelId);
      localStorage.setItem(`ai-quiz-${modelId}`, JSON.stringify(generatedQuiz));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : '퀴즈 생성 실패');
    } finally {
      setAiLoading(false);
    }
  }, [modelId, modelInfo, aiDifficulty, chatHistory, notesContent, resetQuiz]);

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
        {/* 시작 화면 (퀴즈 없거나, 퀴즈 있지만 아직 시작 안 함) */}
        {!progress && (
          <div className="text-center py-8 space-y-5">
            {/* 내장 퀴즈 시작 섹션 */}
            {propQuiz && quizSource === 'builtin' && (
              <>
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                  }`}
                >
                  <svg
                    className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {propQuiz.titleKo}
                  </h3>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {propQuiz.description}
                  </p>
                  <p className={`mt-0.5 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {propQuiz.questions.length}문제 중 10문제 랜덤 출제
                  </p>
                </div>
                <button
                  onClick={handleStart}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  퀴즈 시작
                </button>
              </>
            )}

            {/* AI 퀴즈가 이미 생성되어 있고 AI 소스 선택 중일 때 */}
            {quizSource === 'ai' && aiQuiz && (
              <>
                <div
                  className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                  }`}
                >
                  <svg
                    className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {aiQuiz.titleKo}
                  </h3>
                  <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {aiQuiz.description}
                  </p>
                </div>
                <button
                  onClick={handleStart}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-purple-500 hover:bg-purple-600 text-white'
                  }`}
                >
                  AI 퀴즈 시작
                </button>
              </>
            )}

            {/* 구분선 */}
            {(propQuiz || aiQuiz) && (
              <div className="flex items-center gap-3 py-1">
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>또는</span>
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
              </div>
            )}

            {/* 내장 퀴즈로 전환 버튼 (AI 소스 사용 중이고 내장 퀴즈가 있을 때) */}
            {quizSource === 'ai' && propQuiz && (
              <button
                onClick={() => setQuizSource('builtin')}
                className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode
                    ? 'text-blue-400 hover:bg-blue-900/20'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                내장 퀴즈로 전환
              </button>
            )}

            {/* AI 맞춤 퀴즈 생성 섹션 — 항상 표시 */}
            <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-semibold mb-3 flex items-center gap-1.5 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI 맞춤 퀴즈 생성
              </h4>

              {/* 난이도 선택 */}
              <div className="flex gap-1.5 mb-3">
                {([
                  { value: 'mixed' as DifficultyLevel, label: '혼합' },
                  { value: 'easy' as DifficultyLevel, label: '쉬움' },
                  { value: 'medium' as DifficultyLevel, label: '보통' },
                  { value: 'hard' as DifficultyLevel, label: '어려움' },
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setAiDifficulty(value)}
                    className={`flex-1 py-1.5 text-xs rounded-md font-medium transition-colors ${
                      aiDifficulty === value
                        ? isDarkMode
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-500 text-white'
                        : isDarkMode
                          ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* 학습 데이터 표시 */}
              {(chatHistory || notesContent) && (
                <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  {chatHistory && notesContent ? 'AI 대화 + 노트' : chatHistory ? 'AI 대화' : '노트'} 기반 맞춤 출제
                </p>
              )}

              {aiError && (
                <p className="text-red-500 text-xs mb-2">{aiError}</p>
              )}

              <button
                onClick={handleGenerateAIQuiz}
                disabled={aiLoading || !modelInfo}
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
                  aiLoading
                    ? isDarkMode ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                    : isDarkMode
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                {aiLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {aiQuiz ? 'AI 퀴즈 새로 생성' : 'AI 맞춤 퀴즈 생성'}
                  </>
                )}
              </button>
            </div>
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
            modelNameKo={modelInfo?.nameKo}
          />
        )}
      </div>
    </div>
  );
}
