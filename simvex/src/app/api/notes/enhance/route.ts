import { NextRequest, NextResponse } from 'next/server';

type EnhanceAction = 'summarize' | 'expand' | 'organize' | 'simplify';

interface EnhanceRequest {
  content: string;
  action: EnhanceAction;
  modelNameKo?: string;
}

const ACTION_PROMPTS: Record<EnhanceAction, string> = {
  summarize: `사용자의 학습 노트를 핵심 포인트만 추출하여 정리하세요.
- 글머리 기호(•)를 사용하여 핵심 내용을 나열하세요
- 불필요한 반복이나 부가 설명은 제거하세요
- 중요 키워드는 그대로 유지하세요`,
  expand: `사용자의 간단한 메모를 상세한 학습 노트로 확장하세요.
- 각 항목에 대해 구체적인 설명을 추가하세요
- 관련 공학 원리나 배경 지식을 포함하세요
- 이해하기 쉬운 예시나 비유를 추가하세요`,
  organize: `사용자의 노트를 체계적인 구조로 정리하세요.
- 관련 내용끼리 그룹화하세요
- 제목과 소제목을 사용하여 계층 구조를 만드세요
- 논리적 순서로 재배치하세요
- 원래 내용은 빠짐없이 포함하세요`,
  simplify: `사용자의 노트에 있는 복잡한 전문 용어와 개념을 쉽게 풀어서 설명하세요.
- 전문 용어 옆에 쉬운 설명을 괄호로 추가하세요
- 복잡한 문장은 짧고 간단하게 바꾸세요
- 일상적인 비유를 활용하세요
- 핵심 내용은 유지하되 표현만 쉽게 바꾸세요`,
};

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY_LHH;

    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 },
      );
    }

    const body: EnhanceRequest = await request.json();
    const { content, action, modelNameKo } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '노트 내용이 비어있습니다.' },
        { status: 400 },
      );
    }

    const actionPrompt = ACTION_PROMPTS[action];
    if (!actionPrompt) {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다.' },
        { status: 400 },
      );
    }

    const systemPrompt = `당신은 공학 학습 노트를 개선하는 AI 어시스턴트입니다.
${modelNameKo ? `현재 학습 중인 모델: ${modelNameKo}` : ''}

${actionPrompt}

## 규칙
- 한국어로 작성하세요
- 기술 용어는 한글과 영문을 병기하세요
- 결과만 출력하세요 (안내 문구 없이)`;

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
          { role: 'user', content },
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `AI 처리 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const result =
      data.choices?.[0]?.message?.content ||
      data.output?.message?.content ||
      '';

    if (!result) {
      return NextResponse.json(
        { error: 'AI 응답이 비어있습니다.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Notes Enhance API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
