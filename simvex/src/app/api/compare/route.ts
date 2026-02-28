import { NextRequest, NextResponse } from 'next/server';

interface PartData {
  name: string;
  nameKo: string;
  description: string;
  material?: string;
}

interface CompareRequest {
  partA: PartData;
  partB: PartData;
  modelInfo: {
    name: string;
    nameKo: string;
    description: string;
    theory: string;
    category: string;
  };
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

    const body: CompareRequest = await request.json();
    const { partA, partB, modelInfo } = body;

    const systemPrompt = `당신은 공학 교육용 3D 모델의 부품 비교 분석 전문가입니다.
두 부품을 비교하여 학습에 도움이 되는 분석을 JSON 형태로 제공합니다.

## 모델 정보
- 모델명: ${modelInfo.nameKo} (${modelInfo.name})
- 분류: ${modelInfo.category}
- 설명: ${modelInfo.description}
- 이론: ${modelInfo.theory}

## 비교 대상
- 부품 A: ${partA.nameKo} (${partA.name}) — ${partA.description}${partA.material ? ` [재질: ${partA.material}]` : ''}
- 부품 B: ${partB.nameKo} (${partB.name}) — ${partB.description}${partB.material ? ` [재질: ${partB.material}]` : ''}

## 출력 형식
정확히 아래 JSON 형식으로 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.
각 필드는 한국어로 2~3문장씩 작성하세요.

{
  "roleDifference": "두 부품의 역할/기능 차이 분석",
  "materialComparison": "재질 및 물성 비교 (재질 정보가 없으면 일반적인 공학 지식 기반으로 추론)",
  "interaction": "두 부품 간의 상호작용 및 연결 관계",
  "structuralImportance": "각 부품의 구조적 중요도 비교",
  "summary": "핵심 차이점 한줄 요약"
}`;

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
          { role: 'user', content: `${partA.nameKo}와(과) ${partB.nameKo}를 비교 분석해주세요. JSON만 출력하세요.` },
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `비교 분석 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.output?.message?.content ||
      '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: '비교 분석 데이터 파싱 실패' },
        { status: 500 },
      );
    }

    const comparison = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ comparison });
  } catch (error) {
    console.error('Compare API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
