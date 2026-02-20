import { NextRequest, NextResponse } from 'next/server';

interface NarrationRequest {
  part: {
    name: string;
    nameKo: string;
    description: string;
    material?: string;
  };
  modelInfo: {
    name: string;
    nameKo: string;
    description: string;
    theory: string;
    category: string;
  };
  allParts: { nameKo: string; description: string }[];
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY_LHH || process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const body: NarrationRequest = await request.json();
    const { part, modelInfo, allParts } = body;

    if (!part || !modelInfo) {
      return NextResponse.json(
        { error: '부품 및 모델 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const otherParts = allParts
      ?.filter((p) => p.nameKo !== part.nameKo)
      .map((p) => `- ${p.nameKo}: ${p.description}`)
      .join('\n') || '';

    const systemPrompt = `당신은 공학 교육 전문 나레이터입니다. 3D 기계 부품 뷰어에서 학생들에게 부품을 설명하는 교육적 나레이션을 생성합니다.

## 규칙
- 한국어로 3~5문장의 나레이션을 작성하세요
- 부품의 역할과 기능을 설명하세요
- 재질이 있다면 그 재질의 의미(왜 이 재질인지)를 설명하세요
- 다른 부품과의 관계를 언급하세요
- 가능하면 실제 응용 사례나 흥미로운 사실을 포함하세요
- 음성으로 읽히므로 자연스러운 구어체로 작성하세요
- 마크다운이나 특수문자 없이 평문으로 작성하세요`;

    const userMessage = `## 모델: ${modelInfo.nameKo} (${modelInfo.name})
분류: ${modelInfo.category}
설명: ${modelInfo.description}

## 설명할 부품: ${part.nameKo} (${part.name})
설명: ${part.description}
${part.material ? `재질: ${part.material}` : ''}

## 같은 모델의 다른 부품들
${otherParts}

위 부품에 대한 교육적 나레이션을 생성해주세요.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Narration API Error:', errorData);
      return NextResponse.json(
        { error: `OpenAI API 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const narration = data.choices?.[0]?.message?.content
      || data.output?.message?.content
      || '나레이션을 생성할 수 없습니다.';

    return NextResponse.json({ narration });
  } catch (error) {
    console.error('Narration API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
