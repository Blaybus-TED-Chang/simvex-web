import { NextRequest, NextResponse } from 'next/server';

interface ReportGenerateRequest {
  modelInfo: {
    name: string;
    nameKo: string;
    description: string;
    category: string;
  };
  parts: { id: string; nameKo: string; description: string }[];
  quizData?: { score: number; total: number; wrongPartIds: string[] };
  notesContent?: string;
  chatHistory?: string;
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

    const body: ReportGenerateRequest = await request.json();
    const { modelInfo, parts, quizData, notesContent, chatHistory } = body;

    const partsList = parts
      .map((p) => `- id: "${p.id}", 이름: ${p.nameKo}, 설명: ${p.description}`)
      .join('\n');

    const partIds = parts.map((p) => `"${p.id}"`).join(', ');

    let dataContext = '';
    if (quizData) {
      dataContext += `\n## 퀴즈 성적\n- 점수: ${quizData.score}/${quizData.total}\n`;
      if (quizData.wrongPartIds.length > 0) {
        dataContext += `- 틀린 문제 관련 부품: ${quizData.wrongPartIds.join(', ')}\n`;
      }
    }
    if (notesContent) {
      dataContext += `\n## 학습 노트 내용 (최대 2000자)\n${notesContent.slice(0, 2000)}\n`;
    }
    if (chatHistory) {
      dataContext += `\n## AI 채팅 기록 (최대 2000자)\n${chatHistory.slice(0, 2000)}\n`;
    }

    const systemPrompt = `당신은 공학 학습 분석 전문가입니다. 학생의 3D 기계 모델 학습 데이터를 종합 분석하여 맞춤형 학습 리포트를 생성합니다.

## 모델 정보
- 모델명: ${modelInfo.nameKo} (${modelInfo.name})
- 설명: ${modelInfo.description}
- 분류: ${modelInfo.category}

## 부품 목록
${partsList}
${dataContext}

## 분석 규칙
1. 퀴즈 성적, 노트 내용, AI 채팅 기록을 종합적으로 분석하세요.
2. 데이터가 부족한 경우 모델 구조 이해도를 기반으로 일반적인 학습 조언을 제공하세요.
3. weakParts에는 반드시 아래 부품 ID 목록에 있는 것만 사용하세요.
4. 모든 텍스트는 한국어로 작성하세요.
5. 구체적이고 실용적인 학습 추천을 제공하세요.

## 사용 가능한 부품 ID
[${partIds}]

## 출력 형식
정확히 아래 JSON 형식으로 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.

{
  "overallScore": 75,
  "strengths": ["강점 1", "강점 2"],
  "weaknesses": ["약점 1", "약점 2"],
  "weakParts": ["부품id1", "부품id2"],
  "recommendations": ["추천 1", "추천 2", "추천 3"],
  "summary": "종합 평가 3~5문장"
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
          { role: 'user', content: `${modelInfo.nameKo} 모델에 대한 학습 리포트를 생성해주세요. JSON만 출력하세요.` },
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `리포트 생성 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
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
        { error: '리포트 데이터 파싱 실패' },
        { status: 500 },
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // weakParts 유효성 검증
    const validPartIds = new Set(parts.map((p) => p.id));
    const validWeakParts = (parsed.weakParts || []).filter(
      (id: string) => validPartIds.has(id),
    );

    return NextResponse.json({
      overallScore: parsed.overallScore ?? 50,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      weakParts: validWeakParts,
      recommendations: parsed.recommendations || [],
      summary: parsed.summary || '',
    });
  } catch (error) {
    console.error('Report Generate API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
