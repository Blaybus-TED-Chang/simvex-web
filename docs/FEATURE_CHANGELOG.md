# SIMVEX 신규 기능 정리 (14-feature-enhancement ~ 15-feature-enhancement)

> 최종 업데이트: 2026-02-20
> 대상 커밋: `d74c323` ~ `64d0fc5` (5개 Feature 커밋)

---

## 목차

1. [AI 3D 가이드 투어](#1-ai-3d-가이드-투어)
2. [AI 퀴즈 자동 생성](#2-ai-퀴즈-자동-생성)
3. [노트 AI 강화 (요약/확장/정렬/단순화)](#3-노트-ai-강화)
4. [퀴즈 오답 AI 분석](#4-퀴즈-오답-ai-분석)
5. [PDF AI 학습 정리](#5-pdf-ai-학습-정리)
6. [AI 부품 비교 분석](#6-ai-부품-비교-분석)
7. [AI 플래시카드](#7-ai-플래시카드)
8. [워크플로우 차트](#8-워크플로우-차트)
9. [자동 로그아웃](#9-자동-로그아웃)
10. [AI 음성 해설 (나레이션)](#10-ai-음성-해설-나레이션)
11. [AI 고장 진단 시뮬레이터](#11-ai-고장-진단-시뮬레이터)
12. [AI 학습 리포트](#12-ai-학습-리포트)
13. [AI 조립 순서 추천](#13-ai-조립-순서-추천)
14. [노트 서브탭 UI 개선](#14-노트-서브탭-ui-개선)

---

## 1. AI 3D 가이드 투어


| 항목 | 내용 |
|------|------|
| **커밋** | `d74c323` |
| **API** | `POST /api/guide/generate` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/guide/generate/route.ts`, `src/components/guide/GuideTourOverlay.tsx`, `src/lib/store/guideTourStore.ts`, `src/types/guideTour.ts` |

### 기능 설명

3D 모델의 부품들을 **학습 효과가 높은 순서**로 자동 배열하여 단계별 가이드 투어를 제공합니다.

- AI가 모델/부품 정보를 분석하여 **8~15단계**의 학습 투어를 자동 설계
- 전체 구조 이해 → 핵심 부품 → 보조 부품 → 세부 부품 순서로 구성
- 각 단계마다 **한국어 2~3문장** 설명 (부품 역할, 작동 원리, 다른 부품과의 관계)
- 자동 재생 기능 (2~15초 속도 조절)
- 단계 네비게이션 (이전/다음, 단계 직접 선택)
- **Zustand persist**로 투어 캐시 (같은 모델 재방문 시 재생성 불필요)

### 사용 방법

뷰어 화면 → 가이드 투어 버튼 클릭 → AI가 투어 생성 → 오버레이에서 단계별 학습

---

## 2. AI 퀴즈 자동 생성

| 항목 | 내용 |
|------|------|
| **커밋** | `d74c323` |
| **API** | `POST /api/quiz/generate` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/quiz/generate/route.ts`, `src/components/quiz/QuizPanel.tsx` |

### 기능 설명

기존 내장 퀴즈 외에 AI가 **모델/부품 정보 + 학습 데이터**를 분석하여 맞춤형 퀴즈를 생성합니다.

- **문제 유형**: 객관식 (4지선다), O/X 판별, 부품 클릭 (3D 뷰어 연동)
- **난이도 조절**: easy / medium / hard / mixed
- **컨텍스트 학습**: 사용자의 채팅 기록, 노트 내용을 기반으로 맞춤형 문제 출제
- 10개 문제 자동 생성, 랜덤 셔플
- 진행 상황 localStorage 저장 (퀴즈 중단 후 이어하기 가능)

### 사용 방법

뷰어 우측 사이드바 → 퀴즈 탭 → "AI 퀴즈 생성" 클릭 → 난이도 선택 → 문제 풀기

---

## 3. 노트 AI 강화

| 항목 | 내용 |
|------|------|
| **커밋** | `487ccd6` |
| **API** | `POST /api/notes/enhance` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/notes/enhance/route.ts`, `src/components/notes/NotesPanel.tsx` |

### 기능 설명

사용자가 작성한 노트를 AI가 4가지 방식으로 변환합니다.

| 액션 | 설명 |
|------|------|
| **요약** (`summarize`) | 핵심 포인트만 글머리 기호로 정리 |
| **확장** (`expand`) | 간단한 메모를 구체적 설명 + 예시로 확장 |
| **정렬** (`organize`) | 계층 구조로 체계적으로 재구성 |
| **단순화** (`simplify`) | 전문 용어를 쉬운 설명으로 변환 |

### 사용 방법

뷰어 우측 사이드바 → 노트 탭 → 노트 작성 → AI 강화 버튼 → 액션 선택

---

## 4. 퀴즈 오답 AI 분석

| 항목 | 내용 |
|------|------|
| **커밋** | `487ccd6` |
| **API** | `POST /api/quiz/explain` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/quiz/explain/route.ts` |

### 기능 설명

퀴즈에서 틀린 문제를 AI가 분석하여 **오해(misconception)를 정확히 짚어** 줍니다.

- 학생이 왜 틀렸는지 **오해 포인트** 분석
- 정답에 대한 **상세한 설명**
- 해당 부품/개념에 대한 **학습 팁 3가지** 제공

### API 요청 예시

```json
{
  "wrongQuestions": [
    {
      "question": "드론의 프로펠러 회전 방향은?",
      "userAnswer": "모두 같은 방향",
      "correctAnswer": "시계/반시계 교대",
      "explanation": "토크 상쇄를 위해..."
    }
  ]
}
```

---

## 5. PDF AI 학습 정리

| 항목 | 내용 |
|------|------|
| **커밋** | `487ccd6` |
| **API** | `POST /api/export/summarize` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/export/summarize/route.ts`, `src/components/export/ExportPdfButton.tsx` |

### 기능 설명

PDF 내보내기 시 AI가 **노트 + AI 채팅 기록**을 종합하여 학습 내용을 자동 정리합니다.

- **핵심 포인트** (Key Points) 추출: 글머리 리스트
- **학습 요약** (Summary): 2~3 단락 종합 요약
- 정리된 내용이 PDF 문서에 포함

---

## 6. AI 부품 비교 분석

| 항목 | 내용 |
|------|------|
| **커밋** | `c94df61` |
| **API** | `POST /api/compare` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/compare/route.ts`, `src/components/compare/PartCompareModal.tsx` |

### 기능 설명

두 개의 부품을 선택하여 AI가 **5가지 관점**에서 비교 분석합니다.

| 비교 항목 | 설명 |
|----------|------|
| **역할 차이** | 각 부품의 기능적 차이점 |
| **재질 비교** | 소재와 물리적 특성 비교 |
| **상호작용** | 두 부품이 서로 어떻게 연결/작용하는지 |
| **중요도** | 전체 시스템에서의 상대적 중요성 |
| **종합 비교** | 핵심 차이점 요약 |

### 사용 방법

뷰어에서 부품 선택 → 부품 정보 카드 → "비교" 버튼 → 두 번째 부품 선택 → 비교 모달 표시

---

## 7. AI 플래시카드

| 항목 | 내용 |
|------|------|
| **커밋** | `c94df61` |
| **API** | `POST /api/flashcard/generate` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/flashcard/generate/route.ts`, `src/components/flashcard/FlashcardPanel.tsx`, `src/components/flashcard/FlashcardViewer.tsx` |

### 기능 설명

모델/부품 정보를 기반으로 AI가 **10장의 플래시카드**를 자동 생성합니다.

- **카드 유형**: 개념, 부품, 원리, 응용 혼합 구성
- **맞춤형**: 사용자 노트, AI 채팅 기록을 분석하여 학습한 내용 우선 포함
- **플립 애니메이션**: 카드 클릭 시 앞면(질문) ↔ 뒷면(답변) 전환
- 이전/다음 네비게이션, 카드 번호 표시

### 사용 방법

뷰어 우측 사이드바 → 노트 탭 → 카드 서브탭 → "플래시카드 생성" 클릭

---

## 8. 워크플로우 차트

| 항목 | 내용 |
|------|------|
| **커밋** | `c94df61` |
| **AI 모델** | 없음 (순수 UI) |
| **파일** | `src/app/workflow/page.tsx`, `src/app/workflow/[id]/page.tsx`, `src/components/workflow/` (9개 컴포넌트) |

### 기능 설명

노드 기반 **플로우차트** 페이지로, 학습 내용을 시각적으로 정리할 수 있습니다.

- 노드 생성/삭제/이동 (드래그 앤 드롭)
- 노드 간 엣지(연결선) 생성
- 각 노드에 텍스트 입력
- 단계별 학습 내용 정리 및 공유
- 워크플로우 목록 관리 (`/workflow`)
- 개별 워크플로우 편집 (`/workflow/[id]`)

### 주요 컴포넌트

| 컴포넌트 | 역할 |
|----------|------|
| `WorkflowCanvas.tsx` | 메인 캔버스 (줌/팬) |
| `WorkflowNode.tsx` | 개별 노드 UI |
| `WorkflowEdge.tsx` | 노드 간 연결선 |

---

## 9. 자동 로그아웃

| 항목 | 내용 |
|------|------|
| **커밋** | `c94df61` |
| **파일** | 인증 관련 컴포넌트 |

### 기능 설명

- 세션 만료 시 **자동 로그아웃** 처리
- 로그아웃 후 적절한 리다이렉트

---

## 10. AI 음성 해설 (나레이션)

| 항목 | 내용 |
|------|------|
| **커밋** | `1184833` |
| **API** | `POST /api/narration` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/narration/route.ts`, `src/components/ui/NarrationButton.tsx` |

### 기능 설명

선택한 부품에 대해 AI가 **교육적 나레이션 텍스트**를 생성하고, 브라우저 TTS로 음성 재생합니다.

- **3~5문장** 분량의 교육적 나레이션 생성
- 부품의 기능, 재질의 의미, 다른 부품과의 관계, 실제 응용 사례 포함
- 브라우저 **Web Speech API (TTS)** 연동으로 음성 재생
- **부품별 캐시**: `useRef`로 같은 부품 재클릭 시 API 호출 없이 즉시 재생

### 사용 방법

뷰어에서 부품 클릭 → 부품 정보 영역의 나레이션 버튼 클릭 → 음성 해설 재생

---

## 11. AI 고장 진단 시뮬레이터

| 항목 | 내용 |
|------|------|
| **커밋** | `1184833` |
| **API** | `POST /api/fault/diagnose` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/fault/diagnose/route.ts`, `src/components/fault/FaultDiagnosisModal.tsx` |

### 기능 설명

선택한 부품이 고장났을 때의 **증상, 원인, 영향, 수리 방안**을 AI가 분석합니다.

| 분석 항목 | 설명 |
|----------|------|
| **증상** | 고장 시 나타나는 3가지 증상 |
| **원인** | 고장의 근본 원인 분석 |
| **영향 부품** | 고장으로 인해 영향받는 다른 부품 ID 목록 |
| **심각도** | `critical` / `major` / `minor` 3단계 판정 |
| **수리 방안** | 구체적인 수리/교체 가이드 |

### 3D 뷰어 연동

- 고장 부품: **빨간색 하이라이트**로 표시
- 영향 부품: **주황색 하이라이트**로 표시
- `faultHighlights` prop을 통해 CombinedModelViewer에 전달

### 사용 방법

뷰어에서 부품 클릭 → 부품 정보 카드 → "고장 진단" 버튼 → 진단 모달 표시 + 3D 하이라이트

---

## 12. AI 학습 리포트

| 항목 | 내용 |
|------|------|
| **커밋** | `64d0fc5` |
| **API** | `POST /api/report/generate` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/report/generate/route.ts`, `src/components/report/LearningReportPanel.tsx` |

### 기능 설명

퀴즈 성적, 학습 노트, AI 채팅 기록을 **종합 분석**하여 맞춤형 학습 리포트를 생성합니다.

| 분석 항목 | 설명 |
|----------|------|
| **종합 점수** | 0~100점 원형 게이지로 시각화 |
| **강점** | 잘하는 영역 2~3개 (초록색 체크 리스트) |
| **약점** | 부족한 영역 2~3개 (빨간색 경고 리스트) |
| **약점 부품** | AI가 식별한 약한 부품 (3D 뷰어 하이라이트 가능) |
| **맞춤 추천** | 구체적인 학습 추천 3~4개 (번호 리스트) |
| **종합 평가** | 3~5문장 종합 평가 텍스트 |

### 3D 뷰어 연동

- "약점 부품 하이라이트" 버튼 클릭 시 해당 부품들이 **빨간색으로 강조**
- `faultHighlights`와 병합되어 CombinedModelViewer에 전달

### 데이터 소스

| 소스 | 내용 | 제한 |
|------|------|------|
| 퀴즈 | 점수, 총 문제 수, 틀린 문제 관련 부품 ID | 완료된 퀴즈만 |
| 노트 | 노트 제목 + 본문 텍스트 | 최대 2,000자 |
| 채팅 | AI 대화 기록 (최근 20개) | 최대 2,000자 |

### 사용 방법

뷰어 우측 사이드바 → **리포트 탭** → 데이터 현황 확인 → "리포트 생성" 클릭

---

## 13. AI 조립 순서 추천

| 항목 | 내용 |
|------|------|
| **커밋** | `64d0fc5` |
| **API** | `POST /api/assembly/recommend` |
| **AI 모델** | gpt-5-nano |
| **파일** | `src/app/api/assembly/recommend/route.ts`, `src/components/viewer/AssemblyControls.tsx` |

### 기능 설명

기존 explodeDistance 기반 고정 순서 대신, AI가 **공학적 원칙**에 따라 최적 조립 순서를 추천합니다.

### 조립 순서 결정 원칙

| 우선순위 | 원칙 | 예시 |
|---------|------|------|
| 1 | **물리적 의존성** | 프레임/베이스를 먼저 조립 |
| 2 | **안쪽 → 바깥쪽** | 내부 부품 배치 후 외부 커버 |
| 3 | **무거운 → 가벼운** | 무거운 구조물 먼저, 가벼운 부속 나중 |
| 4 | **기능 그룹** | 관련 부품끼리 연속 배치 |

### UI 변경 사항

| 요소 | 설명 |
|------|------|
| **AI 순서 추천 버튼** | 보라색 그라디언트, sparkle 아이콘 |
| **원래 순서 복원 버튼** | AI 순서 사용 중일 때 표시 |
| **전략 카드** | 접을 수 있는 전체 조립 전략 요약 |
| **단계별 설명** | 각 단계에서 해당 순서인 이유 표시 |
| **보라색 테마** | AI 순서 사용 시 진행 바, 재생 버튼이 보라색으로 변경 |

### 사용 방법

뷰어 우측 사이드바 → 모델 탭 → 조립 애니메이션 ON → **"AI 순서 추천"** 클릭 → AI 순서로 애니메이션 재생

---

## 14. 노트 서브탭 UI 개선

| 항목 | 내용 |
|------|------|
| **커밋** | `64d0fc5` |
| **파일** | `src/app/viewer/[model]/page.tsx` |

### 변경 사항

- 서브탭 (노트 / 핀 주석 / 카드) **가운데 정렬**
- 각 버튼에 `whitespace-nowrap` 적용으로 **텍스트 줄바꿈 방지**
- 라벨 간소화: "나의 노트" → "노트", "플래시카드" → "카드"
- 사이드바 폭이 좁을 때도 깔끔하게 표시

---

## 종합 요약

### 추가된 API 라우트 (11개)

| API | 기능 | AI 모델 |
|-----|------|--------|
| `/api/guide/generate` | 가이드 투어 생성 | gpt-5-nano |
| `/api/quiz/generate` | 퀴즈 자동 생성 | gpt-5-nano |
| `/api/quiz/explain` | 오답 분석 | gpt-5-nano |
| `/api/notes/enhance` | 노트 AI 강화 | gpt-5-nano |
| `/api/export/summarize` | PDF 학습 정리 | gpt-5-nano |
| `/api/compare` | 부품 비교 분석 | gpt-5-nano |
| `/api/flashcard/generate` | 플래시카드 생성 | gpt-5-nano |
| `/api/narration` | 음성 나레이션 | gpt-5-nano |
| `/api/fault/diagnose` | 고장 진단 | gpt-5-nano |
| `/api/report/generate` | 학습 리포트 | gpt-5-nano |
| `/api/assembly/recommend` | 조립 순서 추천 | gpt-5-nano |

### 추가된 컴포넌트 디렉토리 (6개)

```
src/components/
  ├── guide/        → GuideTourOverlay
  ├── compare/      → PartCompareModal
  ├── flashcard/    → FlashcardPanel, FlashcardViewer
  ├── fault/        → FaultDiagnosisModal
  ├── report/       → LearningReportPanel
  └── workflow/     → WorkflowCanvas, WorkflowNode, WorkflowEdge 등 9개
```

### 우측 사이드바 탭 구조

```
모델 | 노트 | 퀴즈 | 리포트
       ├── 노트 (나의 노트)
       ├── 핀 주석
       └── 카드 (플래시카드)
```

### 학습 플로우

```
1. 3D 뷰어에서 부품 학습
      ↓
2. 보조 학습 도구 활용
   - AI 음성 해설 (나레이션)
   - AI 부품 비교
   - AI 플래시카드
   - AI 가이드 투어
      ↓
3. 학습 점검
   - AI 퀴즈 풀이
   - 오답 AI 분석
   - AI 고장 진단
      ↓
4. 학습 종합
   - AI 학습 리포트 (약점 부품 하이라이트)
   - AI 조립 순서 추천
      ↓
5. 기록 관리
   - 노트 AI 강화
   - PDF AI 정리 내보내기
   - 워크플로우 차트 정리
```
