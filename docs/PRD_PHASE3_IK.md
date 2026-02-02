# PRD: Phase 3 - 역기구학 (Inverse Kinematics) 모드

## 개요

| 항목 | 내용 |
|------|------|
| Phase | 3 |
| 기간 | 2026/02/04 ~ 2026/02/06 (3일) |
| 목표 | 목표 위치 지정으로 자동 관절 각도 계산 |
| 선행 조건 | Phase 2 완료 |

---

## 목표

1. 3D 공간에서 목표 위치를 지정할 수 있는 인터페이스
2. 역기구학(IK) 알고리즘으로 관절 각도 자동 계산
3. 현재 위치에서 목표 위치까지 부드러운 애니메이션
4. 도달 불가능 영역 처리 및 시각화

---

## 기능 요구사항

### 3.1 모드 전환

**설명:** FK 모드와 IK 모드 간 전환

**요구사항:**
- [ ] 모드 전환 탭 UI
  ```
  [FK 모드] [IK 모드]
  ─────────────────────
  ```
- [ ] 모드별 컨트롤 패널 변경
  - FK: 관절 슬라이더
  - IK: 목표 위치 입력 + 드래그 컨트롤
- [ ] 모드 전환 시 현재 상태 유지

**완료 기준:**
- 탭 클릭으로 모드 전환
- 각 모드에 맞는 UI 표시

---

### 3.2 목표 위치 지정 (3D 드래그)

**설명:** 3D 공간에서 마우스로 목표 위치 지정

**요구사항:**
- [ ] 목표 마커 (Target Marker)
  - 구 형태 또는 3축 기즈모
  - 반투명 색상 (예: 반투명 초록)
  - 현재 엔드 이펙터와 구분되는 스타일
- [ ] TransformControls 적용
  - 위치 이동만 (회전/스케일 제외)
  - 축별 드래그 가능
- [ ] 드래그 중 실시간 미리보기 (선택)
  - 목표 위치에서의 로봇 자세 반투명 표시

**완료 기준:**
- 목표 마커 드래그 가능
- 3축 방향 개별 이동 가능

---

### 3.3 목표 위치 입력 (수동)

**설명:** 수치 입력으로 정확한 목표 위치 지정

**요구사항:**
- [ ] XYZ 좌표 입력 필드
  ```
  Target Position
  ─────────────────────
  X: [  0.450  ] m
  Y: [  0.320  ] m
  Z: [  0.780  ] m
  ─────────────────────
  [Move to Target]
  ```
- [ ] 입력 값 범위 제한 (작업 영역 내)
- [ ] Enter 키 또는 버튼으로 이동 실행

**완료 기준:**
- 수치 입력 후 로봇 이동
- 범위 외 값 입력 시 경고

---

### 3.4 역기구학 계산

**설명:** 목표 위치에 도달하기 위한 관절 각도 계산

**요구사항:**
- [ ] IK 솔버 구현 (옵션 중 택1)
  - **옵션 A**: CCD (Cyclic Coordinate Descent)
    - 구현 간단, 수렴 빠름
    - Three.js CCDIKSolver 활용 가능
  - **옵션 B**: FABRIK (Forward And Backward Reaching IK)
    - 자연스러운 움직임
    - 직접 구현 필요
  - **옵션 C**: 야코비안 (Jacobian) 방법
    - 학술적으로 정확
    - 구현 복잡도 높음
- [ ] 관절 제한 준수
- [ ] 특이점(Singularity) 처리

**권장 구현 (CCD):**
```typescript
// lib/kinematics/inverseKinematics.ts
export function solveIK(
  targetPosition: Vector3,
  currentJoints: number[],
  dhParams: DHParams[],
  options: {
    maxIterations: number;
    tolerance: number;
  }
): number[] | null {
  // CCD 알고리즘
  // 1. 말단에서 베이스 방향으로 각 관절 순회
  // 2. 각 관절을 목표 방향으로 회전
  // 3. 수렴할 때까지 반복
  // 4. 도달 불가 시 null 반환
}
```

**완료 기준:**
- 대부분의 목표 위치에 도달
- 계산 시간 100ms 이내

---

### 3.5 부드러운 이동 애니메이션

**설명:** 현재 위치에서 목표 위치까지 자연스러운 이동

**요구사항:**
- [ ] 관절 각도 보간 (Lerp/Slerp)
- [ ] 이동 시간 설정 (기본 1초)
- [ ] 이동 중 취소 가능
- [ ] 이동 완료 피드백

**구현 방식:**
```typescript
// useFrame 내에서 보간
useFrame((state, delta) => {
  if (isMoving) {
    joints.forEach((joint, i) => {
      const current = joint.angle;
      const target = targetAngles[i];
      joint.angle = THREE.MathUtils.lerp(current, target, delta * speed);
    });

    if (reachedTarget()) {
      setIsMoving(false);
    }
  }
});
```

**완료 기준:**
- 부드러운 이동 애니메이션
- 급격한 점프 없음

---

### 3.6 도달 불가능 영역 처리

**설명:** 로봇이 도달할 수 없는 위치에 대한 처리

**요구사항:**
- [ ] 작업 영역(Workspace) 시각화
  - 반투명 구 또는 도넛 형태
  - 토글로 표시/숨김
- [ ] 도달 불가 판정
  - IK 솔버가 null 반환 시
  - 최대 반복 횟수 초과 시
- [ ] 도달 불가 시 피드백
  - 목표 마커 빨간색 변경
  - UI 경고 메시지
  - 가장 가까운 도달 가능 위치 제안 (선택)

**작업 영역 계산:**
```
내부 반경 = 가장 짧게 접은 상태의 거리
외부 반경 = 완전히 펼친 상태의 거리
```

**완료 기준:**
- 불가능 위치에서 명확한 피드백
- 작업 영역 시각화 토글

---

### 3.7 엔드 이펙터 방향 제어 (선택)

**설명:** 위치뿐 아니라 방향도 지정

**요구사항:**
- [ ] 방향 입력 UI (Roll, Pitch, Yaw)
- [ ] 6DOF IK로 방향까지 계산
- [ ] 방향 제약 조건 (예: 항상 아래를 향함)

**우선순위:** 낮음 (시간 여유 시 구현)

---

## 기술 명세

### 새로운 컴포넌트

```
src/
├── components/
│   ├── controls/
│   │   ├── ModeSelector.tsx      # FK/IK 모드 탭
│   │   ├── TargetInput.tsx       # 목표 위치 입력
│   │   └── IKControlPanel.tsx    # IK 모드 컨트롤
│   └── robot/
│       ├── TargetMarker.tsx      # 목표 위치 마커
│       └── WorkspaceVisualizer.tsx # 작업 영역 시각화
└── lib/
    └── kinematics/
        └── inverseKinematics.ts  # IK 솔버
```

### IK 솔버 인터페이스

```typescript
// lib/kinematics/inverseKinematics.ts
export interface IKSolverOptions {
  maxIterations: number;    // 최대 반복 (기본: 100)
  tolerance: number;        // 수렴 허용치 (기본: 0.001)
  damping: number;          // 감쇠 계수 (야코비안용)
}

export interface IKResult {
  success: boolean;
  jointAngles: number[];
  iterations: number;
  error: number;            // 목표와의 거리
}

export function solveIK(
  target: Vector3,
  initialAngles: number[],
  options?: Partial<IKSolverOptions>
): IKResult;
```

### Zustand 스토어 확장

```typescript
interface RobotStore {
  // 기존 (Phase 1, 2)
  joints: JointState[];
  endEffectorPosition: Vector3;

  // 추가 (Phase 3)
  mode: 'fk' | 'ik';
  setMode: (mode: 'fk' | 'ik') => void;

  targetPosition: Vector3;
  setTargetPosition: (pos: Vector3) => void;

  isMoving: boolean;
  moveToTarget: () => void;
  cancelMove: () => void;

  showWorkspace: boolean;
  toggleWorkspace: () => void;
}
```

---

## CCD 알고리즘 상세

### 알고리즘 단계

```
1. 초기화
   - 목표 위치 P_target
   - 현재 관절 각도 θ[]

2. 반복 (최대 N회)
   for i = 마지막관절 to 첫번째관절:
     a. 현재 관절 위치 P_joint 계산
     b. 현재 엔드이펙터 위치 P_end 계산
     c. 벡터 계산:
        - V1 = P_end - P_joint (관절→현재엔드)
        - V2 = P_target - P_joint (관절→목표)
     d. 회전 각도 계산:
        - angle = arccos(V1 · V2 / |V1||V2|)
     e. 회전축 계산:
        - axis = V1 × V2
     f. 관절 회전 적용 (제한 범위 내)
     g. FK로 새 엔드이펙터 위치 계산

   if |P_end - P_target| < tolerance:
     return SUCCESS

3. 실패 시 null 반환
```

### 의사 코드

```typescript
function ccdSolve(target: Vector3, joints: Joint[]): boolean {
  for (let iter = 0; iter < MAX_ITER; iter++) {
    for (let i = joints.length - 1; i >= 0; i--) {
      const jointPos = getJointPosition(i);
      const endPos = getEndEffectorPosition();

      const toEnd = endPos.clone().sub(jointPos).normalize();
      const toTarget = target.clone().sub(jointPos).normalize();

      const angle = Math.acos(toEnd.dot(toTarget));
      const axis = toEnd.cross(toTarget).normalize();

      // 관절 축에 투영
      const projectedAngle = projectToJointAxis(angle, axis, joints[i].axis);

      // 제한 적용
      joints[i].angle = clamp(
        joints[i].angle + projectedAngle,
        joints[i].min,
        joints[i].max
      );
    }

    if (getEndEffectorPosition().distanceTo(target) < TOLERANCE) {
      return true;
    }
  }
  return false;
}
```

---

## 완료 체크리스트

- [ ] FK/IK 모드 전환 UI
- [ ] 목표 마커 3D 드래그
- [ ] 목표 위치 수치 입력
- [ ] IK 솔버 구현 (CCD)
- [ ] 부드러운 이동 애니메이션
- [ ] 도달 불가 영역 처리
- [ ] 작업 영역 시각화

---

## 다음 단계 (Phase 4 예고)

Phase 4에서는 경로 프로그래밍을 구현합니다:
- 웨이포인트 저장/관리
- 경로 애니메이션 재생
- 궤적 시각화

---

*문서 버전: 1.0*
*최종 수정: 2026-01-29*
