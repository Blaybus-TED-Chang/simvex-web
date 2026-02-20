import { NextRequest, NextResponse } from 'next/server';

interface PartInfo {
  id: string;
  name: string;
  nameKo: string;
  description: string;
}

interface QuizGenerateRequest {
  modelName: string;
  modelNameKo: string;
  modelDescription: string;
  modelTheory: string;
  parts: PartInfo[];
  questionCount?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  chatHistory?: string;
  notesContent?: string;
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

    const body: QuizGenerateRequest = await request.json();
    const { modelName, modelNameKo, modelDescription, modelTheory, parts, questionCount = 10, difficulty = 'mixed', chatHistory, notesContent } = body;

    const partsList = parts
      .map((p) => `- ${p.nameKo} (${p.name}): ${p.description}`)
      .join('\n');

    // 부품 ID 목록 (identify-part 문제용)
    const partIds = parts.map((p) => `"${p.id}"`).join(', ');

    // 난이도별 분포 설정
    const difficultyGuide = difficulty === 'mixed'
      ? '난이도를 혼합하세요: easy(3~4), medium(3~4), hard(2~3)'
      : difficulty === 'easy'
      ? `모든 문제를 쉬운 난이도(easy)로 생성하세요. 기본 개념과 용어 위주로 출제하세요.`
      : difficulty === 'medium'
      ? `모든 문제를 보통 난이도(medium)로 생성하세요. 원리 이해와 응용 문제를 출제하세요.`
      : `모든 문제를 어려운 난이도(hard)로 생성하세요. 심화 분석, 비교, 응용 문제를 출제하세요.`;

    // 학습 컨텍스트 (채팅 기록 + 노트)
    const learningContext = [];
    if (chatHistory) {
      learningContext.push(`## 사용자의 AI 대화 기록 (최근)\n${chatHistory.slice(0, 2000)}`);
    }
    if (notesContent) {
      learningContext.push(`## 사용자의 학습 노트\n${notesContent.slice(0, 2000)}`);
    }
    const learningContextSection = learningContext.length > 0
      ? `\n\n## 사용자 학습 컨텍스트\n아래 정보를 참고하여 사용자가 학습한 내용과 관련된 문제를 우선 출제하세요. 사용자가 잘 모르는 부분이나 자주 질문한 내용을 중심으로 문제를 만드세요.\n\n${learningContext.join('\n\n')}`
      : '';

    const systemPrompt = `당신은 공학 교육용 퀴즈를 생성하는 전문가입니다.
주어진 3D 기계 모델의 정보와 부품 목록을 기반으로 학습 퀴즈를 JSON 형태로 생성합니다.

## 모델 정보
- 모델명: ${modelNameKo} (${modelName})
- 설명: ${modelDescription}
- 이론: ${modelTheory}

## 부품 목록
${partsList}${learningContextSection}

## 생성 규칙
1. ${questionCount}개의 문제를 생성하세요.
2. 문제 유형을 혼합하세요:
   - "multiple-choice": 4지선다 객관식 (4~5문제)
   - "true-false": O/X 문제 (3~4문제)
   - "identify-part": 부품 클릭 문제 (2~3문제)
3. ${difficultyGuide}
4. 모든 텍스트는 한국어로 작성하세요.
5. 설명(explanation)은 학습에 도움이 되도록 상세히 작성하세요.

## 출력 형식
정확히 아래 JSON 배열 형식으로 출력하세요. 다른 텍스트 없이 JSON만 출력하세요.

[
  {
    "id": "ai-q-1",
    "type": "multiple-choice",
    "question": "질문 내용",
    "options": ["선택지1", "선택지2", "선택지3", "선택지4"],
    "correctAnswer": 0,
    "explanation": "해설",
    "difficulty": "easy"
  },
  {
    "id": "ai-q-2",
    "type": "true-false",
    "question": "O/X 질문 내용",
    "options": ["O", "X"],
    "correctAnswer": 0,
    "explanation": "해설",
    "difficulty": "medium"
  },
  {
    "id": "ai-q-3",
    "type": "identify-part",
    "question": "3D 모델에서 해당 부품을 클릭하세요: [부품 한국어명]",
    "correctAnswer": "부품id",
    "partId": "부품id",
    "explanation": "해설",
    "difficulty": "easy"
  }
]

사용 가능한 부품 ID: [${partIds}]
correctAnswer는 multiple-choice/true-false에서는 정답 인덱스(숫자), identify-part에서는 부품 ID(문자열)입니다.`;

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
          { role: 'user', content: `${modelNameKo} 모델에 대한 ${questionCount}개의 퀴즈를 생성해주세요. JSON 배열만 출력하세요.` },
        ],
        max_completion_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `퀴즈 생성 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      data.output?.message?.content ||
      '';

    // JSON 파싱
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: '퀴즈 데이터 파싱 실패' },
        { status: 500 },
      );
    }

    const questions = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz Generate API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
