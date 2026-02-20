import { NextRequest, NextResponse } from 'next/server';

interface SummarizeRequest {
  noteContents: string;
  chatContents: string;
  modelNameKo: string;
  modelDescription: string;
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

    const body: SummarizeRequest = await request.json();
    const { noteContents, chatContents, modelNameKo, modelDescription } = body;

    if (!noteContents && !chatContents) {
      return NextResponse.json(
        { error: '정리할 내용이 없습니다.' },
        { status: 400 },
      );
    }

    const systemPrompt = `당신은 공학 학습 내용을 정리하는 AI 어시스턴트입니다.

학생이 ${modelNameKo}에 대해 학습한 노트와 AI 대화 내용을 분석하여 학습 정리를 생성하세요.
모델 설명: ${modelDescription}

## 출력 규칙
- 한국어로 작성
- 기술 용어는 한글(영문) 병기
- JSON만 출력 (다른 텍스트 없이)

## 출력 형식
{
  "keyPoints": ["핵심 포인트 1", "핵심 포인트 2", ...],
  "summary": "2~3단락의 학습 요약 텍스트"
}

- keyPoints: 5~8개의 핵심 학습 포인트
- summary: 학습한 내용을 2~3단락으로 요약`;

    const userContent = [];
    if (noteContents) {
      userContent.push(`## 학습 노트\n${noteContents.slice(0, 3000)}`);
    }
    if (chatContents) {
      userContent.push(`## AI 대화 내역\n${chatContents.slice(0, 3000)}`);
    }

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
          { role: 'user', content: userContent.join('\n\n') },
        ],
        max_completion_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      return NextResponse.json(
        { error: `AI 정리 오류: ${errorData.error?.message || '알 수 없는 오류'}` },
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
        { error: '정리 데이터 파싱 실패' },
        { status: 500 },
      );
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Export Summarize API Error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
