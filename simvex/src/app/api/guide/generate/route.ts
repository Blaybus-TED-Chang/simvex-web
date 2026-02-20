import { NextRequest, NextResponse } from 'next/server';

interface PartInfo {
  id: string;
  name: string;
  nameKo: string;
  description: string;
}

interface GuideGenerateRequest {
  modelName: string;
  modelNameKo: string;
  modelDescription: string;
  modelTheory: string;
  parts: PartInfo[];
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY_LHH || process.env.OPENAI_API_KEY;

    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 },
      );
    }

    const body: GuideGenerateRequest = await request.json();
    const { modelName, modelNameKo, modelDescription, modelTheory, parts } = body;

    const partsList = parts
      .map((p) => `- id: "${p.id}", 이름: ${p.nameKo} (${p.name}), 설명: ${p.description}`)
      .join('\n');

    const partIds = parts.map((p) => `"${p.id}"`).join(', ');

    const systemPrompt = `당신은 공학 교육 전문가입니다. 3D 기계 모델의 학습 가이드 투어를 설계합니다.

## 모델 정보
- 모델명: ${modelNameKo} (${modelName})
- 설명: ${modelDescription}
- 이론: ${modelTheory}

## 부품 목록
${partsList}

## 가이드 투어 설계 규칙
1. 학습 효과가 높은 순서로 부품을 배치하세요.
2. 전체 구조 이해 → 핵심 부품 → 보조 부품 → 세부 부품 순서가 좋습니다.
3. 관련 부품끼리 연속으로 배치하세요.
4. 8~15단계로 구성하세요 (부품이 적으면 전부 포함 가능).
5. 각 단계의 explanation은 2~3문장으로 부품의 역할, 작동 원리, 다른 부품과의 관계를 설명하세요.
6. 모든 텍스트는 한국어로 작성하세요.

## 출력 형식
정확히 아래 JSON 형식으로 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "title": "투어 제목",
  "steps": [
    {
      "partId": "부품id",
      "partNameKo": "부품 한국어명",
      "explanation": "이 부품은 ... 역할을 합니다. ...",
      "order": 1
    }
  ]
}

사용 가능한 부품 ID: [${partIds}]
반드시 위 목록에 있는 부품 ID만 사용하세요.`;

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
          { role: 'user', content: `${modelNameKo} 모델의 학습 가이드 투어를 설계해주세요. JSON만 출력하세요.` },
        ],
        max_completion_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `가이드 생성 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.output?.message?.content ||
      '';

    // JSON 파싱
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: '가이드 데이터 파싱 실패' },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // steps 내의 partId가 유효한지 필터링
    const validPartIds = new Set(parts.map((p) => p.id));
    const validSteps = (parsed.steps || []).filter(
      (s: { partId: string }) => validPartIds.has(s.partId),
    );

    return NextResponse.json({
      title: parsed.title || `${modelNameKo} 가이드 투어`,
      steps: validSteps,
    });
  } catch (error) {
    console.error('Guide Generate API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
