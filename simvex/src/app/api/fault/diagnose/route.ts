import { NextRequest, NextResponse } from 'next/server';

interface FaultRequest {
  part: {
    id: string;
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
  allParts: {
    id: string;
    name: string;
    nameKo: string;
    description: string;
    material?: string;
  }[];
}

export interface FaultDiagnosisResult {
  symptoms: string[];
  cause: string;
  affectedParts: string[];
  severity: 'critical' | 'major' | 'minor';
  repairSuggestion: string;
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY_LHH;

    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const body: FaultRequest = await request.json();
    const { part, modelInfo, allParts } = body;

    if (!part || !modelInfo || !allParts) {
      return NextResponse.json(
        { error: '부품, 모델, 전체 부품 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const partIdList = allParts.map((p) => p.id).join(', ');
    const partsDescription = allParts
      .map((p) => `- id: "${p.id}", 이름: ${p.nameKo} (${p.name}), 설명: ${p.description}${p.material ? `, 재질: ${p.material}` : ''}`)
      .join('\n');

    const systemPrompt = `당신은 기계공학 고장 진단 전문가입니다. 3D 기계 모델의 특정 부품이 고장났을 때 증상, 원인, 영향받는 부품, 수리 방안을 분석합니다.

## 응답 규칙
- 반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이)
- affectedParts 배열에는 반드시 다음 ID 목록에서만 선택하세요: [${partIdList}]
- 고장난 부품 자신의 ID는 affectedParts에 포함하지 마세요
- severity는 "critical", "major", "minor" 중 하나만 사용하세요
- 모든 텍스트는 한국어로 작성하세요

## 응답 형식
{
  "symptoms": ["증상1", "증상2", "증상3"],
  "cause": "고장 원인 분석",
  "affectedParts": ["영향받는부품id1", "영향받는부품id2"],
  "severity": "critical" | "major" | "minor",
  "repairSuggestion": "수리 및 대처 방안"
}`;

    const userMessage = `## 모델: ${modelInfo.nameKo} (${modelInfo.name})
분류: ${modelInfo.category}
설명: ${modelInfo.description}
이론: ${modelInfo.theory}

## 고장난 부품: ${part.nameKo} (${part.name})
ID: ${part.id}
설명: ${part.description}
${part.material ? `재질: ${part.material}` : ''}

## 전체 부품 목록
${partsDescription}

위 부품이 고장났을 때의 진단 결과를 JSON으로 응답해주세요.`;

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
      console.error('Fault Diagnosis API Error:', errorData);
      return NextResponse.json(
        { error: `OpenAI API 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content
      || data.output?.message?.content
      || '';

    // JSON 파싱 (코드블록이 있을 수 있으므로 regex로 추출)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse fault diagnosis JSON:', rawContent);
      return NextResponse.json(
        { error: '진단 결과를 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }

    const diagnosis: FaultDiagnosisResult = JSON.parse(jsonMatch[0]);

    // 유효한 부품 ID만 필터링
    const validIds = new Set(allParts.map((p) => p.id));
    diagnosis.affectedParts = diagnosis.affectedParts.filter(
      (id) => validIds.has(id) && id !== part.id
    );

    // severity 유효성 검증
    if (!['critical', 'major', 'minor'].includes(diagnosis.severity)) {
      diagnosis.severity = 'major';
    }

    return NextResponse.json({ diagnosis });
  } catch (error) {
    console.error('Fault Diagnosis API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
