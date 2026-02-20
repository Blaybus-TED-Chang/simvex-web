import { NextRequest, NextResponse } from 'next/server';

interface PartInfo {
  id: string;
  name: string;
  nameKo: string;
  description: string;
}

interface FlashcardGenerateRequest {
  modelName: string;
  modelNameKo: string;
  modelTheory: string;
  parts: PartInfo[];
  notesContent?: string;
  chatHistory?: string;
  cardCount?: number;
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

    const body: FlashcardGenerateRequest = await request.json();
    const { modelName, modelNameKo, modelTheory, parts, notesContent, chatHistory, cardCount = 10 } = body;

    const partsList = parts
      .map((p) => `- ${p.nameKo} (${p.name}): ${p.description}`)
      .join('\n');

    const learningContext = [];
    if (chatHistory) {
      learningContext.push(`## 사용자의 AI 대화 기록 (최근)\n${chatHistory.slice(0, 2000)}`);
    }
    if (notesContent) {
      learningContext.push(`## 사용자의 학습 노트\n${notesContent.slice(0, 2000)}`);
    }
    const learningContextSection = learningContext.length > 0
      ? `\n\n## 사용자 학습 컨텍스트\n아래 정보를 참고하여 사용자가 학습한 내용 위주로 플래시카드를 만드세요.\n\n${learningContext.join('\n\n')}`
      : '';

    const systemPrompt = `당신은 공학 교육용 플래시카드를 생성하는 전문가입니다.
주어진 3D 기계 모델 정보를 기반으로 암기용 플래시카드를 JSON 형태로 생성합니다.

## 모델 정보
- 모델명: ${modelNameKo} (${modelName})
- 이론: ${modelTheory}

## 부품 목록
${partsList}${learningContextSection}

## 생성 규칙
1. ${cardCount}개의 플래시카드를 생성하세요.
2. 카테고리를 혼합하세요:
   - "개념": 기본 용어/정의 (2~3장)
   - "부품": 특정 부품의 역할/기능 (3~4장)
   - "원리": 작동 원리/메커니즘 (2~3장)
   - "응용": 실제 응용/활용 사례 (1~2장)
3. 앞면(front)은 질문 형태, 뒷면(back)은 간결한 답변으로 작성하세요.
4. 답변은 2~3문장 이내로 핵심만 담으세요.
5. 모든 텍스트는 한국어로 작성하세요.

## 출력 형식
정확히 아래 JSON 배열 형식으로 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.

[
  {
    "id": "fc-1",
    "front": "질문 내용",
    "back": "답변 내용",
    "category": "개념"
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
          { role: 'user', content: `${modelNameKo} 모델에 대한 ${cardCount}개의 플래시카드를 생성해주세요. JSON 배열만 출력하세요.` },
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `플래시카드 생성 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
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
        { error: '플래시카드 데이터 파싱 실패' },
        { status: 500 },
      );
    }

    const cards = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Flashcard Generate API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
