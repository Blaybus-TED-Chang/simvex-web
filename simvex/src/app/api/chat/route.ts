import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  modelInfo?: {
    name: string;
    nameKo: string;
    description: string;
    theory: string;
    category: string;
  };
  selectedPart?: {
    name: string;
    nameKo: string;
    description: string;
    material?: string;
  };
  aiModel?: 'gpt-5' | 'gpt-5-mini' | 'gpt-5-nano';
}

function buildSystemPrompt(modelInfo?: ChatRequest['modelInfo'], selectedPart?: ChatRequest['selectedPart']): string {
  let systemPrompt = `당신은 SIMVEX 플랫폼의 AI 학습 어시스턴트입니다.
공학 학습을 돕는 전문가로서, 기계 부품과 구조에 대해 친절하고 상세하게 설명합니다.

## 역할
- 3D 모델의 구조와 작동 원리를 설명합니다
- 각 부품의 역할과 기능을 설명합니다
- 관련 공학 이론과 개념을 쉽게 풀어서 설명합니다
- 학생들의 질문에 친절하게 답변합니다
- 실제 응용 사례와 예시를 들어 이해를 돕습니다

## 응답 스타일
- 한국어로 응답합니다
- 기술 용어는 한글과 영문을 병기합니다 (예: 크랭크축(Crankshaft))
- 복잡한 개념은 단계별로 나눠서 설명합니다
- 필요시 비유나 일상적인 예시를 활용합니다
- 응답은 명확하고 구조화된 형식으로 제공합니다

## ⚠️ 중요: 응답 길이 제한
- **반드시 500토큰 이내로 답변하세요**
- 사용자가 "자세히", "상세하게", "길게" 등을 요청할 경우에만 longer response를 제공하세요
`;

  if (modelInfo) {
    systemPrompt += `
## 현재 학습 중인 모델 정보
- **모델명**: ${modelInfo.nameKo} (${modelInfo.name})
- **분류**: ${modelInfo.category}
- **설명**: ${modelInfo.description}

### 관련 이론
${modelInfo.theory}
`;
  }

  if (selectedPart) {
    systemPrompt += `
## 현재 선택된 부품 정보
- **부품명**: ${selectedPart.nameKo} (${selectedPart.name})
- **설명**: ${selectedPart.description}
${selectedPart.material ? `- **재질**: ${selectedPart.material}` : ''}

사용자가 이 부품에 대해 질문할 가능성이 높습니다. 해당 부품의 역할, 작동 원리, 다른 부품과의 관계 등을 상세히 설명해 주세요.
`;
  }

  systemPrompt += `
## 주의사항
- 확실하지 않은 정보는 추측하지 말고, 일반적인 공학 원리에 기반하여 설명하세요
- 안전 관련 사항이 있다면 반드시 언급하세요
- 학습자의 수준에 맞춰 설명의 깊이를 조절하세요
`;

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY_LHH || process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다. .env.local 파일에 OPENAI_API_KEY_LHH를 설정해주세요.' },
        { status: 500 }
      );
    }

    const body: ChatRequest = await request.json();
    const { messages, modelInfo, selectedPart, aiModel = 'gpt-5-nano' } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 시스템 프롬프트 생성
    const systemPrompt = buildSystemPrompt(modelInfo, selectedPart);

    // OpenAI API 호출
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_completion_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `OpenAI API 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('OpenAI API Response:', JSON.stringify(data, null, 2));

    // GPT-5-mini 응답 구조 확인
    const assistantMessage = data.choices?.[0]?.message?.content
      || data.output?.message?.content
      || data.message?.content
      || data.content
      || data.text
      || (typeof data === 'string' ? data : null)
      || '응답을 생성할 수 없습니다.';

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
