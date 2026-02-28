import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  prompt: string;
  workflowTitle?: string;
}

export interface AIWorkflowNode {
  title: string;
  content: string;
  color?: string;
}

export interface AIWorkflowEdge {
  sourceIndex: number;
  targetIndex: number;
  sourceSide: 'top' | 'bottom' | 'left' | 'right';
  targetSide: 'top' | 'bottom' | 'left' | 'right';
}

export interface AIWorkflowResult {
  nodes: AIWorkflowNode[];
  edges: AIWorkflowEdge[];
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY_LHH;
    if (!apiKey || apiKey === 'your-openai-api-key-here') {
      return NextResponse.json({ error: 'OpenAI API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const body: GenerateRequest = await request.json();
    const { prompt, workflowTitle } = body;

    const systemPrompt = `당신은 공학 학습용 워크플로우 차트를 생성하는 AI입니다.
사용자의 요청에 따라 학습 단계와 흐름을 노드와 연결선 JSON으로 만드세요.

## 출력 형식
반드시 아래 JSON만 출력하세요. 다른 텍스트, 설명, 코드블록은 절대 포함하지 마세요.

{
  "nodes": [
    {
      "title": "단계 제목 (10자 이내)",
      "content": "이 단계에 대한 간결한 설명 (1~2문장, 50자 이내)",
      "color": "#hex색상코드 (선택, 단계 구분 시 사용)"
    }
  ],
  "edges": [
    {
      "sourceIndex": 0,
      "targetIndex": 1,
      "sourceSide": "right",
      "targetSide": "left"
    }
  ]
}

## 규칙
- 노드: 4~7개 (복잡한 요청은 최대 8개)
- 흐름 방향: 좌→우 (sourceSide="right", targetSide="left")
- 분기가 있으면 위→아래 (sourceSide="bottom", targetSide="top") 사용
- 색상은 논리적 그룹(예: 준비/실행/완료)에만 사용
- 한국어로 작성
- 반드시 유효한 JSON 형식만 출력`;

    const userMessage = workflowTitle
      ? `워크플로우 제목: "${workflowTitle}"\n요청: ${prompt}`
      : prompt;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[workflow/generate] OpenAI error:', res.status, errText);
      let errMsg = `OpenAI ${res.status}`;
      try { errMsg = JSON.parse(errText)?.error?.message ?? errMsg; } catch { /* ignore */ }
      throw new Error(errMsg);
    }

    const data = await res.json();
    const text: string =
      data.choices?.[0]?.message?.content ||
      data.output?.message?.content ||
      data.message?.content ||
      '';
    console.log('[workflow/generate] raw response:', text.slice(0, 300));

    // JSON 객체 추출
    let result: AIWorkflowResult | null = null;
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { result = JSON.parse(objMatch[0]); } catch { /* 파싱 실패 */ }
    }

    if (!result || !Array.isArray(result.nodes) || result.nodes.length === 0) {
      console.error('[workflow/generate] 파싱 실패, raw:', text.slice(0, 500));
      throw new Error('워크플로우 생성 실패: 유효한 노드를 받지 못했습니다');
    }

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류';
    console.error('[workflow/generate] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
