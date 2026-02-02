# PRD: Phase 1 - 프로젝트 셋업 및 3D 씬 구축

## 개요

| 항목 | 내용 |
|------|------|
| Phase | 1 |
| 기간 | 2026/01/29 ~ 2026/01/31 (3일) |
| 목표 | 프로젝트 기반 구축 및 기본 3D 로봇 암 렌더링 |

---

## 목표

1. Next.js 프로젝트 초기화 및 개발 환경 구성
2. 기본 레이아웃 및 라우팅 설정
3. Three.js/R3F 통합 및 기본 3D 씬 렌더링
4. 로봇 암 3D 모델 로딩 또는 기본 형태 구현
5. 카메라 컨트롤 구현

---

## 기능 요구사항

### 1.1 프로젝트 초기화

**설명:** Next.js 14 기반 프로젝트 생성 및 필수 패키지 설치

**요구사항:**
- [ ] Next.js 14 (App Router) 프로젝트 생성
- [ ] TypeScript 설정
- [ ] Tailwind CSS 설정
- [ ] ESLint, Prettier 설정
- [ ] 필수 패키지 설치:
  ```
  @react-three/fiber
  @react-three/drei
  three
  @types/three
  zustand
  ```

**완료 기준:**
- `npm run dev`로 개발 서버 실행 가능
- TypeScript 컴파일 에러 없음
- Tailwind 스타일 적용 확인

---

### 1.2 기본 레이아웃

**설명:** 애플리케이션 공통 레이아웃 구성

**요구사항:**
- [ ] 헤더 컴포넌트
  - 로고/타이틀: "SiMVEX"
  - 다크모드 토글 버튼
  - 학습 패널 토글 버튼
- [ ] 메인 레이아웃 (3D 뷰어 + 사이드 패널)
  - 좌측: 3D 뷰어 영역 (flex-grow)
  - 우측: 컨트롤 패널 (고정 너비 320px)
- [ ] 하단 컨트롤 바
  - 재생 컨트롤 영역
  - 웨이포인트 정보 영역

**UI 스펙:**
```
┌─────────────────────────────────────────────────────┐
│ [Logo] SiMVEX - Robot Arm Simulator    [🌙] [📖]   │
├────────────────────────────────┬────────────────────┤
│                                │                    │
│                                │   Control Panel    │
│      3D Viewport               │   (320px)          │
│      (flex-grow)               │                    │
│                                │                    │
├────────────────────────────────┴────────────────────┤
│              Bottom Control Bar                     │
└─────────────────────────────────────────────────────┘
```

**완료 기준:**
- 반응형 레이아웃 동작
- 다크모드 토글 기능 동작

---

### 1.3 3D 씬 초기화

**설명:** React Three Fiber 캔버스 및 기본 씬 구성

**요구사항:**
- [ ] R3F Canvas 컴포넌트 설정
  ```jsx
  <Canvas
    camera={{ position: [3, 3, 3], fov: 50 }}
    shadows
  >
  ```
- [ ] 기본 조명 설정
  - Ambient Light (intensity: 0.5)
  - Directional Light (그림자 포함)
- [ ] 바닥 그리드 (Grid Helper)
- [ ] 좌표축 표시 (Axes Helper)
- [ ] 배경색 설정 (다크모드 연동)

**완료 기준:**
- 3D 씬 렌더링 확인
- 그리드와 좌표축 표시
- 그림자 렌더링 동작

---

### 1.4 카메라 컨트롤

**설명:** 사용자가 3D 씬을 자유롭게 탐색할 수 있는 카메라 컨트롤

**요구사항:**
- [ ] OrbitControls 적용
  - 마우스 좌클릭 드래그: 회전
  - 마우스 휠: 줌
  - 마우스 우클릭 드래그: 패닝
- [ ] 카메라 제한 설정
  - 최소/최대 줌 거리
  - 수직 회전 제한 (바닥 아래로 안 가도록)
- [ ] 카메라 리셋 버튼

**완료 기준:**
- 부드러운 카메라 조작
- 줌/회전 제한 동작
- 리셋 버튼으로 초기 위치 복귀

---

### 1.5 로봇 암 기본 모델

**설명:** 6축 로봇 암의 기본 3D 형태 구현

**요구사항:**
- [ ] 기본 도형으로 로봇 암 구성 (추후 상세 모델로 교체 가능)
  ```
  - Base: 원기둥 (Cylinder)
  - Link 1: 박스 또는 원기둥
  - Link 2: 박스 또는 원기둥
  - Link 3: 박스 또는 원기둥
  - Link 4-6 (Wrist): 작은 원기둥들
  - End Effector: 간단한 그리퍼 형태
  ```
- [ ] 관절별 색상 구분
  ```
  J1: #FF6B6B (빨강)
  J2: #4ECDC4 (청록)
  J3: #45B7D1 (파랑)
  J4: #96CEB4 (초록)
  J5: #FFEAA7 (노랑)
  J6: #DDA0DD (보라)
  ```
- [ ] 계층 구조 설정 (부모-자식 관계)
  ```
  Base
  └── Link1
      └── Link2
          └── Link3
              └── Wrist1
                  └── Wrist2
                      └── Wrist3
                          └── EndEffector
  ```

**완료 기준:**
- 로봇 암 형태 렌더링
- 관절별 색상 구분 확인
- 계층 구조 확인 (콘솔 또는 R3F devtools)

---

## 기술 명세

### 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지
│   └── globals.css         # 글로벌 스타일
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── ControlPanel.tsx
│   │   └── BottomBar.tsx
│   ├── three/
│   │   ├── Scene.tsx       # R3F Canvas 래퍼
│   │   ├── Lighting.tsx    # 조명 설정
│   │   ├── Environment.tsx # 그리드, 좌표축
│   │   └── CameraControls.tsx
│   └── robot/
│       ├── RobotArm.tsx    # 로봇 암 메인 컴포넌트
│       ├── Joint.tsx       # 관절 컴포넌트
│       └── Link.tsx        # 링크 컴포넌트
├── lib/
│   └── store/
│       └── robotStore.ts   # Zustand 스토어 (관절 상태)
└── types/
    └── robot.ts            # 타입 정의
```

### 상태 관리 (Zustand)

```typescript
// lib/store/robotStore.ts
interface JointState {
  angle: number;      // 현재 각도 (라디안)
  min: number;        // 최소 각도
  max: number;        // 최대 각도
  name: string;       // 관절 이름
}

interface RobotStore {
  joints: JointState[];
  setJointAngle: (index: number, angle: number) => void;
  resetJoints: () => void;
}
```

### 타입 정의

```typescript
// types/robot.ts
export interface JointConfig {
  id: string;
  name: string;
  axis: 'x' | 'y' | 'z';
  min: number;  // degrees
  max: number;  // degrees
  default: number;
  color: string;
}

export interface LinkConfig {
  id: string;
  length: number;
  radius: number;
}
```

---

## 완료 체크리스트

- [ ] 프로젝트 초기화 완료
- [ ] 기본 레이아웃 구현
- [ ] 3D 씬 렌더링
- [ ] 카메라 컨트롤 동작
- [ ] 로봇 암 기본 형태 표시
- [ ] Vercel 배포 테스트

---

## 다음 단계 (Phase 2 예고)

Phase 2에서는 FK 모드를 구현합니다:
- 관절 슬라이더 UI
- 실시간 관절 회전
- 엔드 이펙터 위치 계산

---

*문서 버전: 1.0*
*최종 수정: 2026-01-29*
