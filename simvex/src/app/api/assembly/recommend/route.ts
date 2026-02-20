import { NextRequest, NextResponse } from 'next/server';

interface AssemblyRecommendRequest {
  modelInfo: {
    name: string;
    nameKo: string;
    description: string;
    theory: string;
    category: string;
  };
  parts: { id: string; name: string; nameKo: string; description: string; material?: string }[];
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

    const body: AssemblyRecommendRequest = await request.json();
    const { modelInfo, parts } = body;

    const partsList = parts
      .map((p) => `- id: "${p.id}", 이름: ${p.nameKo} (${p.name}), 설명: ${p.description}${p.material ? `, 재료: ${p.material}` : ''}`)
      .join('\n');

    const partIds = parts.map((p) => `"${p.id}"`).join(', ');

    const systemPrompt = `당신은 기계 조립 전문가입니다. 3D 기계 모델의 최적 조립 순서를 공학적으로 분석합니다.

## 모델 정보
- 모델명: ${modelInfo.nameKo} (${modelInfo.name})
- 설명: ${modelInfo.description}
- 이론: ${modelInfo.theory}
- 분류: ${modelInfo.category}

## 부품 목록
${partsList}

## 조립 순서 결정 원칙
1. **물리적 의존성**: 지지 구조(프레임, 베이스)를 먼저 조립
2. **안쪽 → 바깥쪽**: 내부 부품을 먼저 배치한 후 외부 부품
3. **무거운 → 가벼운**: 무거운 구조물 먼저, 가벼운 부속품 나중에
4. **기능 그룹**: 관련 부품끼리 연속으로 조립
5. 각 단계마다 왜 이 순서인지 이유를 1문장으로 설명

## 사용 가능한 부품 ID
[${partIds}]

반드시 위 목록에 있는 부품 ID만 사용하세요. 모든 부품을 포함해야 합니다.

## 출력 형식
정확히 아래 JSON 형식으로 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "order": [
    { "partId": "부품id", "step": 1, "reason": "이 부품을 먼저 조립하는 이유" }
  ],
  "strategy": "전체 조립 전략 설명 1~2문장"
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
          { role: 'user', content: `${modelInfo.nameKo} 모델의 최적 조립 순서를 추천해주세요. JSON만 출력하세요.` },
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `조립 순서 추천 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
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
        { error: '조립 순서 데이터 파싱 실패' },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // partId 유효성 검증
    const validPartIds = new Set(parts.map((p) => p.id));
    const validOrder = (parsed.order || []).filter(
      (o: { partId: string }) => validPartIds.has(o.partId),
    );

    // 누락된 부품은 끝에 추가
    const includedIds = new Set(validOrder.map((o: { partId: string }) => o.partId));
    let maxStep = validOrder.length;
    for (const part of parts) {
      if (!includedIds.has(part.id)) {
        maxStep++;
        validOrder.push({ partId: part.id, step: maxStep, reason: '자동 추가된 부품' });
      }
    }

    return NextResponse.json({
      order: validOrder,
      strategy: parsed.strategy || '',
    });
  } catch (error) {
    console.error('Assembly Recommend API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
