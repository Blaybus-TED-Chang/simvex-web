# CLAUDE.md - SIMVEX 프로젝트 지침서

## 프로젝트 개요

**SIMVEX**: 공학 학습용 웹 기반 3D 기계 부품 뷰어

- **목표**: 3D 뷰어를 통한 기계 구조 3차원 시각화 및 학습
- **타겟 사용자**: 공대생, 로봇/기계공학 입문자
- **배포**: Vercel
- **마감**: 2025년 2월 11일 (해커톤)

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.x, React 19.x, TypeScript |
| 3D 그래픽 | Three.js, @react-three/fiber, @react-three/drei |
| 상태관리 | Zustand (localStorage 영속성) |
| 스타일링 | Tailwind CSS 4.x |
| 배포 | Vercel |

---

## 3D 에셋

### 원본 에셋 (etc/3D Asset/)
7개 기계 모델 원본 파일

| 모델 | 경로 | 상태 |
|------|------|------|
| Suspension (서스펜션) | `etc/3D Asset/Suspension/` | 미구현 |
| V4 Engine (V4 엔진) | `etc/3D Asset/V4_Engine/` | 미구현 |
| Robot Gripper (로봇 집게) | `etc/3D Asset/Robot Gripper/` | 미구현 |
| Robot Arm (로봇 팔) | `etc/3D Asset/Robot Arm/` | 미구현 |
| Leaf Spring (판스프링) | `etc/3D Asset/Leaf Spring/` | 미구현 |
| Machine Vice (공작 바이스) | `etc/3D Asset/Machine Vice/` | 미구현 |
| Drone (드론) | `etc/3D Asset/Drone/` | 미구현 |

### 수정된 에셋 (etc/3D Asset modify/)
통합 GLB 형식으로 변환된 파일

| 모델 | 파일 | 부품 수 | 상태 |
|------|------|---------|------|
| Drone (드론) | `drone-combined.glb` | 36개 | ✅ 구현됨 |

---

## 구현 요구사항

### 필수 구현 (MVP)

#### 1. 학습 기계/장비 조회 ✅
- [x] 홈페이지에 3D 오브젝트 선택 카드/버튼
- [x] 각 모델별 썸네일 이미지 표시
- [x] 클릭 시 해당 모델 뷰어 페이지로 이동

#### 2. 3D 모델 출력 ✅
- [x] GLB 파일 로딩 및 뷰포트 렌더링
- [x] 조명 설정 (Ambient + Directional)
- [x] MeshStandardMaterial (색상 기반, 텍스쳐 미사용)
- [x] 그리드 및 배경

#### 3. 3D 오브젝트 인터랙션 ✅
- [x] 마우스 드래그로 화면 회전 (OrbitControls)
- [x] 마우스 스크롤로 줌 인/아웃
- [x] 부품 조립도 형태로 오브젝트 배치

#### 4. 분해/조립 조절용 GUI ⭐ ✅
- [x] 분해도 조절 슬라이더 (0% ~ 100%)
- [x] 슬라이더 값에 따른 부품 위치 이동
- [x] 완제품(0%) ↔ 분해도(100%)
- [x] 제품 구조/이론 설명 패널

#### 5. 부품 정보 조회 ✅
- [x] 부품 클릭 시 선택 하이라이트 (emissive)
- [x] 선택된 부품명 표시
- [x] 부품 역할/기능 설명 표시
- [x] 부품 호버 시 하이라이트

#### 6. 사용자 데이터 저장 (부분 완료)
- [ ] 현재 뷰 상태 저장 (카메라 위치, 분해도, 줌)
- [ ] 새로고침 시 상태 복원
- [x] JSON 형태로 localStorage 저장 (노트, 다크모드만)

#### 7. 측면 서브 노트 (메모장) ✅
- [x] 측면 패널에 노트 영역
- [x] 텍스트 입력 및 저장
- [x] 패널 접기/펼치기 버튼
- [x] 패널 크기 조절 (드래그)

#### 8. 서브 AI 어시스턴트 ✅
- [x] 노트 ↔ AI 탭 전환 버튼
- [x] AI 채팅 인터페이스
- [x] OpenAI GPT-5-mini API 연동
- [x] 현재 모델/부품 컨텍스트 전달
- [x] 대화 기록 유지

---

### 추가 구현 (확장 기능)

#### 9. 퀴즈
- [ ] 학습 후 이해도 확인 퀴즈
- [ ] 내장 퀴즈 랜덤 출제
- [ ] 정답/오답 피드백

#### 10. 워크플로우 차트
- [ ] 노드 기반 플로우 차트 페이지
- [ ] 각 노드에 텍스트 입력
- [ ] 단계별 학습 내용 정리/공유

#### 11. PDF 출력
- [ ] 현재 뷰어 이미지 자동 캡처
- [ ] 노트 + AI 정리 내용 문서화
- [ ] PDF 다운로드

---

---

## 프로젝트 구조

```
2026-01-TEDChang/
├── CLAUDE.md                 # 이 파일
├── docs/                     # 기존 PRD 문서
├── etc/
│   ├── 3D Asset/            # 원본 GLB 모델 파일들
│   ├── 3D Asset modify/     # 수정된 통합 GLB 파일들
│   └── [도사] MVP 해커톤 기획서.xlsx
└── simvex/                   # Next.js 프로젝트
    ├── public/
    │   └── models/
    │       └── drone/
    │           └── drone-combined.glb  # 통합 드론 모델
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx     # 홈 (모델 선택)
    │   │   ├── api/
    │   │   │   └── chat/
    │   │   │       └── route.ts  # AI 채팅 API
    │   │   ├── viewer/
    │   │   │   └── [model]/
    │   │   │       └── page.tsx  # 동적 뷰어 페이지
    │   │   ├── robot-arm/   # 기존 시뮬레이터
    │   │   └── jet-engine/  # 기존 시뮬레이터
    │   ├── components/
    │   │   ├── viewer/
    │   │   │   ├── ModelViewer.tsx
    │   │   │   ├── CombinedGLBPart.tsx  # 통합 GLB 뷰어
    │   │   │   ├── ExplodeSlider.tsx
    │   │   │   ├── PartInfo.tsx
    │   │   │   ├── ProductInfo.tsx
    │   │   │   ├── PartsList.tsx
    │   │   │   └── NotesPanel.tsx  # 노트 + AI 채팅
    │   │   ├── three/       # 기존 3D 컴포넌트
    │   │   └── layout/      # 기존 레이아웃
    │   ├── data/
    │   │   └── models/
    │   │       ├── index.ts
    │   │       └── droneCombined.ts  # 통합 드론 모델 설정
    │   ├── lib/
    │   │   └── store/
    │   │       └── viewerStore.ts   # 뷰어 상태 (Zustand)
    │   └── types/
    │       └── viewer.ts
    ├── .env.local           # OPENAI_API_KEY
    └── package.json
```

---

## 타입 정의

### 모델 메타데이터 (src/types/viewer.ts)

```typescript
// 개별 부품 정보
interface PartConfig {
  id: string;
  glbFile: string;              // GLB 파일명
  name: string;                 // 부품명 (영문)
  nameKo: string;               // 부품명 (한글)
  description: string;          // 역할/기능 설명
  material?: string;            // 재질 정보
  assemblyPosition: [number, number, number];  // 조립 위치
  assemblyRotation?: [number, number, number]; // 조립 회전
  explodeDirection: [number, number, number];  // 분해 방향
  explodeDistance: number;      // 분해 거리
  color?: string;               // 하이라이트 색상
}

// 제품(모델) 정보
interface ModelConfig {
  id: string;                   // URL slug (e.g., 'suspension')
  name: string;                 // 제품명 (영문)
  nameKo: string;               // 제품명 (한글)
  description: string;          // 제품 설명
  theory: string;               // 관련 이론/원리
  category: string;             // 분류 (자동차, 로봇, 항공 등)
  thumbnail: string;            // 썸네일 이미지 경로
  basePath: string;             // GLB 파일 기본 경로
  parts: PartConfig[];          // 부품 목록
}

// 뷰어 상태
interface ViewerState {
  currentModel: string | null;
  explodeValue: number;         // 0 ~ 1
  selectedPartId: string | null;
  visibleParts: Set<string>;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  notes: string;
  isDarkMode: boolean;
}
```

---

## 구현 현황

### ✅ 완료됨
1. 기본 뷰어 페이지 구현 (`/viewer/[model]`)
2. 통합 GLB 모델 지원 (CombinedGLBPart)
3. 분해/조립 슬라이더 구현
4. 부품 클릭 선택 및 정보 표시
5. 홈페이지 모델 선택 UI
6. 노트 패널 구현
7. AI 어시스턴트 통합 (OpenAI GPT-5-mini)
8. 다크모드 지원
9. 드론 통합 모델 (36개 부품)

### 🔄 진행 중 / 부분 완료
- 사용자 데이터 저장 (노트, 다크모드만 저장됨 / 카메라 상태 미저장)
- 다른 모델 추가 (현재 드론만 완료)

### ❌ 미구현
- 퀴즈 기능
- 워크플로우 차트
- PDF 출력

---

## 개발 명령어

```bash
# 개발 서버 실행
cd simvex && npm run dev

# 빌드
cd simvex && npm run build

# 린트
cd simvex && npm run lint
```

---

## AI 어시스턴트 설정

### 환경 변수 (.env.local)

```
OPENAI_API_KEY=sk-proj-...
```

### API 설정 (src/app/api/chat/route.ts)

- **모델**: `gpt-5-mini` (reasoning 모델)
- **max_completion_tokens**: 16000 (reasoning 토큰 포함)
- **시스템 프롬프트**: 현재 모델/부품 정보 포함
- **응답 길이**: 기본 500토큰 이내, 상세 요청 시 확장

### 주의사항

- GPT-5-mini는 reasoning 모델로, 토큰의 일부가 내부 추론에 사용됨
- `max_completion_tokens`가 너무 작으면 응답이 비어있을 수 있음
- 텍스쳐 관련 에러는 자동 억제됨 (CombinedGLBPart.tsx)

---

## 통합 GLB 방식 가이드 (권장)

### 개요

여러 부품을 **하나의 GLB 파일**로 통합하여 export하고, 웹에서 메시 이름으로 각 부품을 식별하여 분해/조립하는 방식입니다.

**장점:**
- 부품들이 이미 올바른 위치에 조립되어 있음
- 파일 로딩 1회로 모든 부품 로드
- 부품 간 상대 위치 정확함

### Maya → GLB Export 워크플로우

1. Maya에서 모든 부품을 하나의 씬에 배치/조립
2. 각 부품(메시)에 **고유한 이름** 부여 (예: `Impeller_Blade`, `Main_Frame`)
3. File → Export All → glTF 2.0 (*.glb) 선택
4. Export 옵션에서 "Meshes" 체크

### ⚠️ 중요: 메시 이름 변환 규칙

**Three.js GLTFLoader는 메시 이름에서 특수문자를 제거합니다!**

| Maya 원본 이름 | Three.js 로드 후 이름 |
|---------------|---------------------|
| `Part:Solid1` | `PartSolid1` (콜론 제거) |
| `Main_frame:Solid1` | `Main_frameSolid1` |

**해결 방법:**
- 설정 파일의 `meshName`에는 **콜론 없는 이름** 사용
- 또는 Maya에서 export 전에 콜론 없는 이름으로 변경

### 메시 이름 확인 방법

GLB 파일의 실제 메시 이름을 확인하려면:

```javascript
// analyze-glb.js
const fs = require('fs');
const buffer = fs.readFileSync('your-file.glb');
const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

const chunk0Length = dataView.getUint32(12, true);
const jsonData = buffer.slice(20, 20 + chunk0Length).toString('utf8');
const gltf = JSON.parse(jsonData);

// 노드(메시) 이름 출력
gltf.nodes?.forEach((node, i) => {
  if (node.mesh != null) console.log(`[${i}] ${node.name} (MESH)`);
});
```

실행: `node analyze-glb.js`

### 설정 파일 예시

```typescript
// src/data/models/example.ts
export const exampleModel: CombinedModelConfig = {
  id: 'example',
  name: 'Example Model',
  nameKo: '예제 모델',
  glbPath: '/models/example/combined.glb',  // 통합 GLB 경로
  parts: [
    {
      id: 'blade',
      meshName: 'Impeller_BladeSolid1',  // 콜론 없이!
      nameKo: '블레이드',
      explodeDirection: [0, 1, 0],  // Y축 방향으로 분해
      explodeDistance: 2,           // 2 단위 이동
    },
    {
      id: 'frame',
      meshName: 'Main_frameSolid1',
      nameKo: '프레임',
      explodeDirection: [1, 0, 0],
      explodeDistance: 1.5,
    },
  ],
};
```

### 컴포넌트 사용

```tsx
import { CombinedGLBViewer } from '@/components/viewer/CombinedGLBPart';

<CombinedGLBViewer
  model={exampleModel}
  explodeValue={0.5}  // 0~1: 조립~분해
  selectedPartId={selectedId}
  onSelectPart={setSelectedId}
  // ...
/>
```

### 현재 구현된 모델

- **드론 (drone)**: `/viewer/drone` - 36개 부품, 통합 GLB 방식

---

## 주의사항

1. **GLB 파일 경로**: etc/3D Asset/의 파일을 simvex/public/models/로 복사하여 사용
2. **한글 파일명**: 일부 GLB 파일명에 한글이 있으므로 영문으로 리네이밍 권장
3. **부품 위치**: 각 GLB 파일의 원점이 다를 수 있으므로 조립 위치 수동 조정 필요
4. **성능**: 많은 GLB 파일 동시 로딩 시 메모리 주의, 필요시 LOD 적용
5. **메시 이름**: Three.js는 메시 이름에서 콜론(:) 등 특수문자를 제거함 (위 가이드 참조)
6. **텍스쳐 미사용**: 텍스쳐 대신 `color` 속성으로 부품 색상 지정 (MeshStandardMaterial)
7. **SSR Hydration**: Zustand persist에 `skipHydration: true` 설정됨, 클라이언트에서 수동 rehydrate 필요

---

## 참고 자료

- 기획서: `etc/[도사] MVP 해커톤 기획서.xlsx`
- 조립도 이미지: 각 모델 폴더 내 PNG 파일
- 기존 PRD: `docs/PRD_PHASE*.md`
