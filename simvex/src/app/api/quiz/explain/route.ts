import { NextRequest, NextResponse } from 'next/server';

interface WrongQuestion {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface ExplainRequest {
  wrongQuestions: WrongQuestion[];
  modelNameKo: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY_LHH;

    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 },
      );
    }

    const body: ExplainRequest = await request.json();
    const { wrongQuestions, modelNameKo } = body;

    if (!wrongQuestions || wrongQuestions.length === 0) {
      return NextResponse.json(
        { error: '분석할 오답이 없습니다.' },
        { status: 400 },
      );
    }

    const questionsText = wrongQuestions
      .map(
        (q, i) =>
          `${i + 1}. 문제: ${q.question}\n   사용자 답: ${q.userAnswer}\n   정답: ${q.correctAnswer}\n   기본 해설: ${q.explanation}`,
      )
      .join('\n\n');

    const systemPrompt = `당신은 공학 교육 전문가입니다. 학생이 ${modelNameKo} 퀴즈에서 틀린 문제들을 분석합니다.

각 오답에 대해 다음 3가지를 JSON 배열로 제공하세요:
1. misconception: 학생이 가졌을 수 있는 오해나 혼동 포인트 (1~2문장)
2. detailedExplanation: 정답인 이유와 관련 개념을 쉽게 설명 (3~5문장)
3. tip: 비슷한 문제를 맞히기 위한 학습 팁 (1문장)

## 규칙
- 한국어로 작성
- 기술 용어는 한글(영문) 병기
- JSON 배열만 출력 (다른 텍스트 없이)

## 출력 형식
[
  {
    "misconception": "...",
    "detailedExplanation": "...",
    "tip": "..."
  }
]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `다음 ${wrongQuestions.length}개 오답을 분석해주세요:\n\n${questionsText}` },
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `AI 분석 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.output?.message?.content ||
      '';

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: '분석 데이터 파싱 실패' },
        { status: 500 },
      );
    }

    const analyses = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Quiz Explain API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
