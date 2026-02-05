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
| 3D 그래픽 | Three.js 0.182, @react-three/fiber, @react-three/drei |
| 상태관리 | Zustand (localStorage 영속성) |
| 인증/DB/스토리지 | Supabase (Auth + PostgreSQL + Storage) |
| AI | OpenAI GPT-5-mini |
| 스타일링 | Tailwind CSS 4.x |
| 배포 | Vercel |

---

## 환경 변수 (.env.local)

```
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 3D 에셋

### 원본 에셋 (etc/3D Asset/)
7개 기계 모델 원본 파일

| 모델 | 경로 | 구현 상태 |
|------|------|----------|
| Drone (드론) | `etc/3D Asset/Drone/` | ✅ 통합 GLB 구현 (36부품) |
| Robot Arm (로봇 팔) | `etc/3D Asset/Robot Arm/` | ✅ 통합 GLB 구현 (10부품) |
| Leaf Spring (판스프링) | `etc/3D Asset/Leaf Spring/` | ✅ 통합 GLB 구현 (11부품) |
| Suspension (서스펜션) | `etc/3D Asset/Suspension/` | ✅ 개별 GLB 구현 (4부품) |
| V4 Engine (V4 엔진) | `etc/3D Asset/V4_Engine/` | ⚠️ 설정만 존재 (홈 미노출) |
| Robot Gripper (로봇 집게) | `etc/3D Asset/Robot Gripper/` | ⚠️ 설정만 존재 (홈 미노출) |
| Machine Vice (공작 바이스) | `etc/3D Asset/Machine Vice/` | ⚠️ 설정만 존재 (홈 미노출) |

### 수정된 에셋 (etc/3D Asset modify/)
통합 GLB 형식으로 변환된 파일

| 모델 | 파일 | 부품 수 | 상태 |
|------|------|---------|------|
| Drone (드론) | `Test_drone_1_glb.glb` | 36개 | ✅ 구현됨 |
| Robot Arm (로봇 팔) | `RobotArm_1_glb.glb` | 10개 | ✅ 구현됨 |
| Leaf Spring (판스프링) | `LeafSpring.glb.glb` | 11개 | ✅ 구현됨 |

---

## 구현 요구사항

### 필수 구현 (MVP)

#### 1. 학습 기계/장비 조회 ✅
- [x] 홈페이지에 3D 오브젝트 선택 카드/버튼
- [x] 각 모델별 썸네일 이미지 표시 (슬라이드쇼)
- [x] 클릭 시 해당 모델 뷰어 페이지로 이동
- [x] 커뮤니티 모델 섹션 (사용자 업로드 모델)

#### 2. 3D 모델 출력 ✅
- [x] GLB 파일 로딩 및 뷰포트 렌더링
- [x] 조명 설정 (Ambient + Directional x4)
- [x] MeshStandardMaterial (색상 기반, 텍스쳐 미사용)
- [x] 그리드 및 배경
- [x] 통합 GLB 방식 (단일 파일, 메시 이름으로 부품 식별)

#### 3. 3D 오브젝트 인터랙션 ✅
- [x] 마우스 드래그로 화면 회전 (OrbitControls)
- [x] 마우스 스크롤로 줌 인/아웃
- [x] 부품 조립도 형태로 오브젝트 배치

#### 4. 분해/조립 조절용 GUI ✅
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
- [x] 노트 저장 (localStorage + Supabase)
- [x] 다크모드 저장 (localStorage)
- [x] 분해도 값 저장 (localStorage)
- [x] 현재 모델 ID 저장 (localStorage)
- [ ] 카메라 위치/타겟 저장 및 복원
- [ ] 줌 레벨 저장 및 복원

#### 7. 측면 서브 노트 (메모장) ✅
- [x] 측면 패널에 노트 영역
- [x] 텍스트 입력 및 저장
- [x] 패널 접기/펼치기 버튼
- [x] 패널 크기 조절 (드래그)
- [x] 로그인 시 Supabase 동기화

#### 8. 서브 AI 어시스턴트 ✅
- [x] 노트 ↔ AI 탭 전환 버튼
- [x] AI 채팅 인터페이스
- [x] OpenAI GPT-5-mini API 연동
- [x] 현재 모델/부품 컨텍스트 전달
- [x] 대화 기록 유지 (Supabase 동기화)

#### 9. 사용자 인증 ✅
- [x] Supabase Auth 이메일/비밀번호 로그인
- [x] 회원가입 및 이메일 인증
- [x] 세션 관리 (미들웨어)
- [x] AuthButton 컴포넌트 (로그인/로그아웃)

#### 10. 사용자 3D 모델 업로드 ✅
- [x] GLB/FBX 파일 업로드 (드래그앤드롭)
- [x] FBX → GLB 브라우저 변환 (FBXLoader + GLTFExporter)
- [x] 메시 자동 감지 + 분해 설정 자동 생성
- [x] 3D 미리보기 (분해 슬라이더 포함)
- [x] 부품 설정 편집 (색상, 이름, 분해 방향/거리)
- [x] 카메라 위치 실시간 반영 (CameraSync)
- [x] 썸네일 자동 캡처
- [x] Supabase Storage 업로드
- [x] 모델 수정/삭제/공개 토글
- [x] `/viewer/u-{uuid}` 경로로 뷰어 연동
- [x] 홈페이지 커뮤니티 모델 섹션 (보라색 테마)
- [x] 50MB 파일 크기 제한

---

### 추가 구현 (확장 기능) — 미구현

#### 11. 퀴즈
- [ ] 학습 후 이해도 확인 퀴즈
- [ ] 내장 퀴즈 랜덤 출제
- [ ] 정답/오답 피드백

#### 12. 워크플로우 차트
- [ ] 노드 기반 플로우 차트 페이지
- [ ] 각 노드에 텍스트 입력
- [ ] 단계별 학습 내용 정리/공유

#### 13. PDF 출력
- [ ] 현재 뷰어 이미지 자동 캡처
- [ ] 노트 + AI 정리 내용 문서화
- [ ] PDF 다운로드

---

## 프로젝트 구조

```
2026-01-TEDChang/
├── CLAUDE.md                 # 이 파일
├── docs/                     # 기존 PRD 문서 (Phase 1~6)
├── etc/
│   ├── 3D Asset/            # 원본 GLB 모델 파일들
│   ├── 3D Asset modify/     # 수정된 통합 GLB 파일들
│   └── [도사] MVP 해커톤 기획서.xlsx
└── simvex/                   # Next.js 프로젝트
    ├── public/
    │   └── models/           # 11개 모델 디렉토리, 61개 GLB
    │       ├── drone-combined/    # 통합 드론 (1 GLB + 8 썸네일)
    │       ├── robot-arm-combined/ # 통합 로봇팔 (1 GLB + 1 썸네일)
    │       ├── leaf-spring-combined/ # 통합 판스프링 (1 GLB + 2 썸네일)
    │       ├── suspension/        # 개별 서스펜션 (5 GLB + 1 썸네일)
    │       ├── drone/             # 개별 드론 (10 GLB)
    │       ├── robot-arm/         # 개별 로봇팔 (8 GLB)
    │       ├── robot-gripper/     # 개별 로봇집게 (8 GLB)
    │       ├── leaf-spring/       # 개별 판스프링 (9 GLB)
    │       ├── machine-vice/      # 개별 바이스 (10 GLB)
    │       └── v4-engine/         # 개별 V4엔진 (7 GLB)
    ├── supabase/
    │   └── migrations/
    │       └── 20260206_user_models.sql  # 업로드 기능 DB 마이그레이션
    ├── src/
    │   ├── app/
    │   │   ├── page.tsx               # 홈 (모델 선택 + 커뮤니티)
    │   │   ├── api/chat/route.ts      # AI 채팅 API
    │   │   ├── auth/
    │   │   │   ├── login/page.tsx     # 로그인/회원가입
    │   │   │   └── callback/route.ts  # OAuth 콜백
    │   │   ├── upload/page.tsx        # 모델 업로드/관리
    │   │   ├── viewer/
    │   │   │   └── [model]/page.tsx   # 동적 뷰어 (기본 + 사용자 모델)
    │   │   ├── robot-arm/page.tsx     # 레거시 시뮬레이터
    │   │   └── jet-engine/page.tsx    # 레거시 시뮬레이터
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── AuthButton.tsx     # 로그인/로그아웃 버튼
    │   │   ├── upload/
    │   │   │   ├── FileDropzone.tsx   # 파일 드래그앤드롭
    │   │   │   ├── ModelPreview.tsx   # 3D 미리보기 + 분해 슬라이더
    │   │   │   ├── PartConfigEditor.tsx # 부품 설정 편집
    │   │   │   └── MyModelGrid.tsx    # 내 모델 목록
    │   │   ├── viewer/
    │   │   │   ├── ModelViewer.tsx         # 개별 GLB 뷰어
    │   │   │   ├── CombinedGLBPart.tsx    # 통합 GLB 뷰어 (메인)
    │   │   │   ├── ExplodeSlider.tsx
    │   │   │   ├── PartInfo.tsx
    │   │   │   ├── ProductInfo.tsx
    │   │   │   ├── PartsList.tsx
    │   │   │   ├── DebugPanel.tsx         # 디버그 패널
    │   │   │   └── NotesPanel.tsx         # 노트 + AI 채팅
    │   │   ├── three/       # 레거시 3D 컴포넌트
    │   │   └── layout/      # 레거시 레이아웃
    │   ├── data/models/
    │   │   ├── index.ts               # 모델 목록 + 헬퍼 함수
    │   │   ├── droneCombined.ts       # 드론 통합 (36부품)
    │   │   ├── robotArmCombined.ts    # 로봇팔 통합 (10부품)
    │   │   ├── leafSpringCombined.ts  # 판스프링 통합 (11부품)
    │   │   ├── suspension.ts          # 서스펜션 개별 (4부품)
    │   │   ├── drone.ts               # 드론 개별
    │   │   ├── robotArm.ts            # 로봇팔 개별
    │   │   ├── robotGripper.ts        # 로봇집게 개별
    │   │   ├── leafSpring.ts          # 판스프링 개별
    │   │   ├── machineVice.ts         # 바이스 개별
    │   │   └── v4engine.ts            # V4엔진 개별
    │   ├── hooks/
    │   │   ├── useUser.ts             # 인증 상태
    │   │   ├── useUserModels.ts       # 업로드 모델 CRUD
    │   │   ├── useSupabaseNotes.ts    # 노트 Supabase 동기화
    │   │   └── useSupabaseChat.ts     # 채팅 Supabase 동기화
    │   ├── lib/
    │   │   ├── supabase/
    │   │   │   ├── client.ts          # 브라우저 Supabase 클라이언트
    │   │   │   ├── server.ts          # SSR Supabase 클라이언트
    │   │   │   └── middleware.ts       # 세션 갱신 미들웨어
    │   │   ├── upload/
    │   │   │   ├── fbxToGlb.ts        # FBX→GLB 변환
    │   │   │   ├── autoExplodeConfig.ts # 자동 분해 설정
    │   │   │   └── thumbnailCapture.ts  # 썸네일 캡처
    │   │   └── store/
    │   │       └── viewerStore.ts     # 뷰어 상태 (Zustand)
    │   ├── types/
    │   │   ├── viewer.ts              # 뷰어/모델 타입
    │   │   └── userModel.ts           # 업로드 모델 타입
    │   └── middleware.ts              # Next.js 미들웨어
    ├── .env.local
    └── package.json
```

---

## 라우트 맵

| 경로 | 설명 |
|------|------|
| `/` | 홈페이지 (기본 모델 + 커뮤니티 모델) |
| `/viewer/[model]` | 기본 모델 뷰어 (예: `/viewer/drone-combined`) |
| `/viewer/u-[uuid]` | 사용자 업로드 모델 뷰어 |
| `/upload` | 모델 업로드/관리 (로그인 필요) |
| `/auth/login` | 로그인/회원가입 |
| `/auth/callback` | OAuth 콜백 |
| `/api/chat` | AI 채팅 API (POST) |
| `/robot-arm` | 레거시 로봇팔 시뮬레이터 |
| `/jet-engine` | 레거시 제트엔진 시뮬레이터 |

---

## 타입 정의

### 모델 메타데이터 (src/types/viewer.ts)

```typescript
// 개별 부품 정보 (개별 GLB 방식)
interface PartConfig {
  id: string;
  glbFile: string;
  name: string;
  nameKo: string;
  description: string;
  material?: string;
  assemblyPosition: [number, number, number];
  assemblyRotation?: [number, number, number];
  explodeDirection: [number, number, number];
  explodeDistance: number;
  color?: string;
}

// 제품(모델) 정보 (개별 GLB 방식)
interface ModelConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  theory: string;
  category: string;
  thumbnail: string;
  thumbnails?: string[];
  basePath: string;
  parts: PartConfig[];
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
}
```

### 통합 GLB 타입 (src/components/viewer/CombinedGLBPart.tsx)

```typescript
// 통합 GLB 부품 설정
interface CombinedPartConfig {
  id: string;
  meshName: string;        // GLB 내부 메시 이름
  name: string;
  nameKo: string;
  description: string;
  material?: string;
  explodeDirection: [number, number, number];
  explodeDistance: number;
  color?: string;
}

// 통합 모델 설정
interface CombinedModelConfig {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  theory: string;
  category: string;
  thumbnail: string;
  thumbnails?: string[];
  glbPath: string;          // 단일 GLB 파일 경로
  scale?: number;
  cameraPosition?: [number, number, number];
  cameraTarget?: [number, number, number];
  parts: CombinedPartConfig[];
}
```

### 업로드 모델 타입 (src/types/userModel.ts)

```typescript
interface UserModelRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  is_public: boolean;
  glb_storage_path: string;
  thumbnail_storage_path: string | null;
  file_size_bytes: number;
  parts_config: UserModelPartConfig[];
  scale: number;
  camera_position: number[];
  camera_target: number[];
  created_at: string;
  updated_at: string;
}

// 카테고리: '자동차' | '로봇' | '항공' | '기계' | '전자' | '기타'
```

---

## 데이터베이스 (Supabase)

### 테이블

| 테이블 | 용도 | RLS |
|--------|------|-----|
| `user_notes` | 사용자 노트 (model별) | 본인만 읽기/쓰기 |
| `chat_conversations` | AI 대화 기록 (model별) | 본인만 읽기/쓰기 |
| `user_models` | 업로드 모델 메타데이터 | 본인 CRUD + 공개 모델 읽기 |

### Storage

| 버킷 | 용도 | 공개 |
|------|------|------|
| `user-models` | 업로드 GLB + 썸네일 | 읽기 공개, 쓰기 본인 폴더만 |

Storage 경로: `{user_id}/{model_id}/model.glb`, `{user_id}/{model_id}/thumbnail.png`

---

## 구현 현황

### ✅ 완료됨
1. 기본 뷰어 페이지 (`/viewer/[model]`)
2. 통합 GLB 모델 지원 (CombinedGLBPart + CameraSync)
3. 분해/조립 슬라이더
4. 부품 클릭 선택 및 정보 표시
5. 홈페이지 모델 선택 UI (썸네일 슬라이드쇼)
6. 노트 패널 (리사이즈, Supabase 동기화)
7. AI 어시스턴트 (GPT-5-mini, Supabase 대화 저장)
8. 다크모드/라이트모드 (영속성)
9. 드론 통합 모델 (36개 부품)
10. 로봇팔 통합 모델 (10개 부품)
11. 판스프링 통합 모델 (11개 부품)
12. 서스펜션 개별 모델 (4개 부품)
13. Supabase 인증 (로그인/회원가입/세션)
14. 사용자 모델 업로드 (GLB/FBX, 자동 분해 설정, 썸네일)
15. 모델 수정/삭제/공개 토글
16. 커뮤니티 모델 섹션 (홈페이지)
17. 디버그 모드 (개별 모델 부품 조정)

### ⚠️ 부분 완료
- **사용자 데이터 저장**: 노트, 다크모드, 분해도 저장됨 / 카메라 상태 미저장
- **모델 추가**: V4 엔진, 로봇 집게, 공작 바이스 설정 파일 존재하나 홈페이지 미노출 (통합 GLB 미제작)

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

### API 설정 (src/app/api/chat/route.ts)

- **모델**: `gpt-5-mini` (reasoning 모델)
- **max_completion_tokens**: 16000 (reasoning 토큰 포함)
- **시스템 프롬프트**: 현재 모델/부품 정보 포함, 한국어 응답
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
  glbPath: '/models/example/combined.glb',
  parts: [
    {
      id: 'blade',
      meshName: 'Impeller_BladeSolid1',  // 콜론 없이!
      nameKo: '블레이드',
      explodeDirection: [0, 1, 0],
      explodeDistance: 2,
    },
  ],
};
```

### 현재 구현된 통합 모델

- **드론 (drone-combined)**: `/viewer/drone-combined` - 36개 부품
- **로봇팔 (robot-arm-combined)**: `/viewer/robot-arm-combined` - 10개 부품
- **판스프링 (leaf-spring-combined)**: `/viewer/leaf-spring-combined` - 11개 부품

---

## 사용자 모델 업로드 시스템

### 업로드 흐름
1. `/upload` 접속 (로그인 필요, 미로그인 시 `/auth/login` 리다이렉트)
2. GLB 또는 FBX 파일 드래그앤드롭 (FBX는 자동 GLB 변환)
3. 메시 자동 감지 → 분해 설정 자동 생성
4. 3D 미리보기에서 분해 슬라이더로 확인
5. 부품 설정 편집 (이름, 색상, 분해 방향/거리)
6. 카메라/스케일/카테고리 설정
7. 업로드 → `/viewer/u-{uuid}`로 이동

### 뷰어 연동
- URL: `/viewer/u-{uuid}` → `u-` 접두사로 사용자 모델 판별
- Supabase에서 `user_models` 레코드 fetch → `CombinedModelConfig`로 변환
- `glbPath`에 Supabase Storage 공개 URL 사용

### 홈페이지 표시
- 공개 모델 (is_public=true) 최대 6개
- 로그인 시 본인 비공개 모델 추가 표시
- 보라색 테마 카드 (기본 모델은 초록색)

---

## 주요 패턴

### Supabase 클라이언트
```typescript
// 브라우저: createClient() from '@/lib/supabase/client'
// SSR: createClient() from '@/lib/supabase/server'
```

### 인증 훅
```typescript
const { user, loading } = useUser();
```

### DB 훅 패턴 (API 라우트 없이 직접 호출)
```typescript
// useSupabaseNotes(user, modelId) → { notes, saveNotes, loaded }
// useSupabaseChat(user, modelId) → { messages, saveMessages, ... }
// useUserModels(user) → { models, uploadModel, updateModel, deleteModel, ... }
```

### Zustand 영속성
```typescript
// skipHydration: true 설정됨
// 컴포넌트에서 수동 rehydrate 필요:
useEffect(() => { useViewerStore.persist.rehydrate(); }, []);
```

---

## 주의사항

1. **GLB 파일 경로**: etc/3D Asset/의 파일을 simvex/public/models/로 복사하여 사용
2. **한글 파일명**: 일부 GLB 파일명에 한글이 있으므로 영문으로 리네이밍 권장
3. **부품 위치**: 각 GLB 파일의 원점이 다를 수 있으므로 조립 위치 수동 조정 필요
4. **성능**: 많은 GLB 파일 동시 로딩 시 메모리 주의, 필요시 LOD 적용
5. **메시 이름**: Three.js는 메시 이름에서 콜론(:) 등 특수문자를 제거함 (위 가이드 참조)
6. **텍스쳐 미사용**: 텍스쳐 대신 `color` 속성으로 부품 색상 지정 (MeshStandardMaterial)
7. **SSR Hydration**: Zustand persist에 `skipHydration: true` 설정됨, 클라이언트에서 수동 rehydrate 필요
8. **CameraSync**: CombinedModelViewer 내부에서 카메라 prop 변경 시 동적으로 위치 업데이트

---

## 참고 자료

- 기획서: `etc/[도사] MVP 해커톤 기획서.xlsx`
- 조립도 이미지: 각 모델 폴더 내 PNG 파일
- 기존 PRD: `docs/PRD_PHASE*.md`
- DB 마이그레이션: `supabase/migrations/20260206_user_models.sql`
