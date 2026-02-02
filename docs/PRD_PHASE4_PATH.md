# PRD: Phase 4 - 경로 프로그래밍

## 개요

| 항목 | 내용 |
|------|------|
| Phase | 4 |
| 기간 | 2026/02/07 ~ 2026/02/08 (2일) |
| 목표 | 웨이포인트 기반 경로 저장 및 재생 |
| 선행 조건 | Phase 3 완료 |

---

## 목표

1. 웨이포인트(중간 지점) 저장 및 관리
2. 저장된 경로를 순차적으로 재생
3. 엔드 이펙터 궤적 시각화
4. 재생 속도 제어

---

## 기능 요구사항

### 4.1 웨이포인트 저장

**설명:** 현재 로봇 상태를 웨이포인트로 저장

**요구사항:**
- [ ] 저장 버튼 (또는 단축키 'S')
- [ ] 저장 시 기록 데이터:
  - 6개 관절 각도
  - 엔드 이펙터 위치
  - 저장 시간
  - 웨이포인트 이름 (자동 생성: WP1, WP2, ...)
- [ ] 저장 피드백
  - 버튼 색상 변화
  - 3D 공간에 마커 표시

**완료 기준:**
- 버튼 클릭으로 현재 상태 저장
- 저장된 웨이포인트 목록 표시

---

### 4.2 웨이포인트 목록 관리

**설명:** 저장된 웨이포인트 확인 및 관리

**요구사항:**
- [ ] 웨이포인트 목록 UI
  ```
  Waypoints (3)
  ─────────────────────
  1. WP1  [🎯] [✏️] [🗑️]
     X: 0.45, Y: 0.32, Z: 0.78

  2. WP2  [🎯] [✏️] [🗑️]
     X: 0.30, Y: 0.50, Z: 0.60

  3. WP3  [🎯] [✏️] [🗑️]
     X: 0.55, Y: 0.20, Z: 0.90
  ─────────────────────
  [+ Add Current] [Clear All]
  ```
- [ ] 웨이포인트 작업
  - 🎯 Go: 해당 위치로 이동
  - ✏️ Edit: 이름 변경
  - 🗑️ Delete: 삭제
- [ ] 드래그 앤 드롭으로 순서 변경
- [ ] 전체 삭제 버튼 (확인 다이얼로그)

**완료 기준:**
- 웨이포인트 CRUD 동작
- 순서 변경 가능

---

### 4.3 경로 재생

**설명:** 웨이포인트를 순서대로 방문하는 애니메이션

**요구사항:**
- [ ] 재생 컨트롤 UI
  ```
  [⏮] [▶ Play] [⏸] [⏭]   Speed: [1x ▼]

  Progress: ████████░░░░░░░░ 2/3
  ```
- [ ] 재생 기능
  - Play: 첫 번째부터 순차 이동
  - Pause: 현재 위치에서 정지
  - Stop: 처음으로 돌아감
  - 이전/다음: 한 웨이포인트씩 이동
- [ ] 반복 재생 옵션
  - 한 번만
  - 무한 반복
  - 왕복 (Ping-pong)

**완료 기준:**
- 부드러운 순차 이동
- 재생/정지 제어 동작

---

### 4.4 재생 속도 제어

**설명:** 경로 재생 속도 조절

**요구사항:**
- [ ] 속도 옵션
  - 0.25x (느림)
  - 0.5x
  - 1x (기본)
  - 2x
  - 4x (빠름)
- [ ] 슬라이더로 세밀한 조절 (선택)

**완료 기준:**
- 속도 변경 시 즉시 반영

---

### 4.5 궤적 시각화

**설명:** 엔드 이펙터가 지나간 경로를 선으로 표시

**요구사항:**
- [ ] 경로 선 (Line)
  - 웨이포인트 간 연결선
  - 색상: 그라데이션 또는 단색
  - 두께: 2-3px
- [ ] 웨이포인트 마커
  - 각 웨이포인트 위치에 작은 구
  - 번호 라벨 (1, 2, 3...)
- [ ] 현재 진행 위치 표시
  - 재생 중 현재 위치 하이라이트
- [ ] 토글로 표시/숨김

**시각화 스타일:**
```
      (2)
       ○
      /  \
    /      \
(1)○────────○(3)
   \         │
    \        │
     ○───────○
    (Start) (4)
```

**완료 기준:**
- 경로 선 렌더링
- 웨이포인트 마커 표시
- 재생 중 진행 상태 시각화

---

### 4.6 경로 저장/불러오기

**설명:** 경로 데이터를 파일로 저장 및 불러오기

**요구사항:**
- [ ] LocalStorage 저장 (자동)
- [ ] JSON 파일 내보내기
  ```json
  {
    "name": "Pick and Place Demo",
    "created": "2026-02-07T10:30:00Z",
    "waypoints": [
      {
        "id": "wp1",
        "name": "Home",
        "joints": [0, 0, 0, 0, 0, 0],
        "position": { "x": 0.5, "y": 0, "z": 0.8 }
      },
      // ...
    ]
  }
  ```
- [ ] JSON 파일 불러오기
- [ ] 샘플 경로 프리셋 (선택)

**완료 기준:**
- 내보내기/불러오기 동작
- 페이지 새로고침 후에도 유지

---

## 기술 명세

### 새로운 컴포넌트

```
src/
├── components/
│   ├── path/
│   │   ├── WaypointList.tsx      # 웨이포인트 목록
│   │   ├── WaypointItem.tsx      # 개별 웨이포인트
│   │   ├── PlaybackControls.tsx  # 재생 컨트롤
│   │   └── TrajectoryLine.tsx    # 궤적 선
│   └── robot/
│       └── WaypointMarker.tsx    # 3D 웨이포인트 마커
└── lib/
    ├── store/
    │   └── pathStore.ts          # 경로 상태 관리
    └── utils/
        └── pathExport.ts         # 내보내기/불러오기
```

### 경로 상태 관리

```typescript
// lib/store/pathStore.ts
interface Waypoint {
  id: string;
  name: string;
  joints: number[];
  position: Vector3;
  timestamp: number;
}

interface PathStore {
  waypoints: Waypoint[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  loopMode: 'once' | 'loop' | 'pingpong';

  // Actions
  addWaypoint: (joints: number[]) => void;
  removeWaypoint: (id: string) => void;
  reorderWaypoints: (fromIndex: number, toIndex: number) => void;
  clearWaypoints: () => void;

  play: () => void;
  pause: () => void;
  stop: () => void;
  next: () => void;
  previous: () => void;

  setSpeed: (speed: number) => void;
  setLoopMode: (mode: 'once' | 'loop' | 'pingpong') => void;

  goToWaypoint: (index: number) => void;
}
```

### 궤적 렌더링

```jsx
// components/path/TrajectoryLine.tsx
import { Line } from '@react-three/drei';

function TrajectoryLine({ waypoints, currentIndex }) {
  const points = waypoints.map(wp => [wp.position.x, wp.position.y, wp.position.z]);

  return (
    <>
      {/* 전체 경로 */}
      <Line
        points={points}
        color="#4ECDC4"
        lineWidth={2}
        dashed={false}
      />

      {/* 웨이포인트 마커 */}
      {waypoints.map((wp, i) => (
        <WaypointMarker
          key={wp.id}
          position={wp.position}
          index={i}
          isActive={i === currentIndex}
        />
      ))}
    </>
  );
}
```

### 보간 애니메이션

```typescript
// 관절 각도 보간
function interpolateJoints(
  from: number[],
  to: number[],
  t: number // 0 ~ 1
): number[] {
  return from.map((angle, i) => {
    return THREE.MathUtils.lerp(angle, to[i], easeInOutCubic(t));
  });
}

// 이징 함수
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
```

---

## UI 레이아웃

### 하단 컨트롤 바 (확장)

```
┌─────────────────────────────────────────────────────────────┐
│ [⏮] [▶] [⏸] [⏭] [🔄 Loop]  Speed: [1x ▼]  │  WP: 2/5      │
├─────────────────────────────────────────────────────────────┤
│ Progress: ████████████░░░░░░░░░░░░░░░░░░░░░░░░░  40%       │
└─────────────────────────────────────────────────────────────┘
```

### 사이드 패널 웨이포인트 섹션

```
┌────────────────────────┐
│ Waypoints              │
├────────────────────────┤
│ ≡ 1. Home        [🎯][🗑]│
│ ≡ 2. Pick        [🎯][🗑]│
│ ≡ 3. Lift        [🎯][🗑]│
│ ≡ 4. Move        [🎯][🗑]│
│ ≡ 5. Place       [🎯][🗑]│
├────────────────────────┤
│ [+ Add] [📥] [📤]      │
└────────────────────────┘
```

---

## 완료 체크리스트

- [ ] 웨이포인트 저장 기능
- [ ] 웨이포인트 목록 UI
- [ ] 경로 재생 컨트롤
- [ ] 재생 속도 조절
- [ ] 궤적 시각화
- [ ] LocalStorage 저장
- [ ] JSON 내보내기/불러오기

---

## 다음 단계 (Phase 5 예고)

Phase 5에서는 학습 패널과 UI 폴리싱을 진행합니다:
- 로봇 구조 설명
- FK/IK 개념 설명
- UI 다듬기 및 반응형 개선

---

*문서 버전: 1.0*
*최종 수정: 2026-01-29*
