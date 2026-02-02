# PRD: Phase 2 - 순기구학 (Forward Kinematics) 모드

## 개요

| 항목 | 내용 |
|------|------|
| Phase | 2 |
| 기간 | 2026/02/01 ~ 2026/02/03 (3일) |
| 목표 | 관절 각도 조절 및 실시간 로봇 암 제어 |
| 선행 조건 | Phase 1 완료 |

---

## 목표

1. 각 관절을 개별적으로 제어할 수 있는 슬라이더 UI 구현
2. 슬라이더 조작에 따른 실시간 로봇 암 회전
3. 엔드 이펙터(말단장치)의 실시간 위치 계산 및 표시
4. 관절 각도 제한 및 시각적 피드백

---

## 기능 요구사항

### 2.1 관절 컨트롤 패널

**설명:** 6개 관절 각각을 조절할 수 있는 슬라이더 UI

**요구사항:**
- [ ] 관절별 슬라이더 컴포넌트
  - 슬라이더 라벨 (관절 이름 + 현재 각도)
  - 범위: 각 관절의 min/max 값
  - 실시간 값 표시 (degree 단위)
- [ ] 관절 정보 표시
  ```
  J1 (Base)        [────●────────]  45°
  J2 (Shoulder)    [──────────●──]  120°
  J3 (Elbow)       [────●────────]  -30°
  J4 (Wrist 1)     [──────●──────]  0°
  J5 (Wrist 2)     [────────●────]  15°
  J6 (Wrist 3)     [────●────────]  -45°
  ```
- [ ] 관절 그룹 구분
  - Arm (J1, J2, J3)
  - Wrist (J4, J5, J6)
- [ ] 전체 리셋 버튼

**관절 기본 설정:**
| 관절 | 이름 | 축 | 최소 | 최대 | 기본값 |
|------|------|-----|------|------|--------|
| J1 | Base | Y | -180° | 180° | 0° |
| J2 | Shoulder | Z | -90° | 90° | 0° |
| J3 | Elbow | Z | -135° | 135° | 0° |
| J4 | Wrist 1 | Z | -180° | 180° | 0° |
| J5 | Wrist 2 | Y | -120° | 120° | 0° |
| J6 | Wrist 3 | Z | -360° | 360° | 0° |

**완료 기준:**
- 슬라이더 드래그 시 값 변경
- 관절별 색상 라벨 표시
- 리셋 버튼 동작

---

### 2.2 실시간 관절 회전

**설명:** 슬라이더 값 변경 시 3D 로봇 암이 실시간으로 회전

**요구사항:**
- [ ] Zustand 스토어와 3D 모델 연동
- [ ] 각 관절의 회전축(axis)에 따른 회전 적용
- [ ] 부드러운 회전 (선택적 lerp 적용)
- [ ] 관절 계층 구조에 따른 연쇄 회전

**구현 방식:**
```jsx
// 각 관절의 회전
<group rotation={[0, joints[0].angle, 0]}> {/* J1: Y축 */}
  <Link1 />
  <group rotation={[0, 0, joints[1].angle]}> {/* J2: Z축 */}
    <Link2 />
    <group rotation={[0, 0, joints[2].angle]}> {/* J3: Z축 */}
      {/* ... */}
    </group>
  </group>
</group>
```

**완료 기준:**
- 슬라이더 조작 시 즉시 반영
- 모든 6개 관절 독립적으로 회전
- 자식 관절이 부모 회전에 따라 이동

---

### 2.3 엔드 이펙터 위치 계산

**설명:** 현재 관절 각도에 따른 엔드 이펙터의 3D 위치 계산

**요구사항:**
- [ ] Forward Kinematics 계산 구현
  - DH 파라미터 또는 변환 행렬 방식
- [ ] 실시간 위치 업데이트
- [ ] 위치 정보 UI 표시
  ```
  End Effector Position
  ─────────────────────
  X:  0.450 m
  Y:  0.320 m
  Z:  0.780 m
  ─────────────────────
  Orientation
  Roll:   15°
  Pitch:  30°
  Yaw:    45°
  ```
- [ ] 3D 씬에 위치 마커 표시 (작은 구 또는 십자)

**FK 계산 수식 (간략):**
```
T_total = T_base * T_1 * T_2 * T_3 * T_4 * T_5 * T_6

각 T_i는 4x4 변환 행렬:
T_i = Rot(axis, θ_i) * Trans(link_length)

최종 위치 = T_total의 translation 부분
최종 방향 = T_total의 rotation 부분
```

**완료 기준:**
- 관절 변경 시 위치 값 업데이트
- 3D 마커와 UI 값 일치
- 소수점 3자리까지 표시

---

### 2.4 관절 제한 시각화

**설명:** 관절이 제한에 가까워지면 시각적 피드백 제공

**요구사항:**
- [ ] 슬라이더 색상 변화
  - 정상 범위: 기본 색상
  - 제한 근처 (90% 이상): 주황색
  - 제한 도달: 빨간색
- [ ] 3D 모델 관절 하이라이트 (선택)
- [ ] 제한 도달 시 미세 진동 효과 (선택)

**완료 기준:**
- 제한 근처에서 색상 변화
- 제한 값 초과 불가

---

### 2.5 관절 하이라이트

**설명:** 슬라이더 호버/조작 시 해당 관절 3D 하이라이트

**요구사항:**
- [ ] 슬라이더 hover 시 해당 관절 outline 또는 glow 효과
- [ ] 현재 조작 중인 관절 강조
- [ ] 관절 클릭 시 해당 슬라이더로 스크롤

**완료 기준:**
- UI-3D 연동 하이라이트 동작
- 어떤 관절을 조작 중인지 명확히 인지 가능

---

## 기술 명세

### 새로운 컴포넌트

```
src/
├── components/
│   ├── controls/
│   │   ├── JointSlider.tsx       # 단일 관절 슬라이더
│   │   ├── JointControlPanel.tsx # 전체 관절 패널
│   │   └── PositionDisplay.tsx   # 위치 표시 UI
│   └── robot/
│       └── EndEffectorMarker.tsx # 엔드 이펙터 마커
└── lib/
    ├── kinematics/
    │   └── forwardKinematics.ts  # FK 계산 함수
    └── utils/
        └── math.ts               # 수학 유틸리티
```

### Forward Kinematics 구현

```typescript
// lib/kinematics/forwardKinematics.ts
import * as THREE from 'three';

interface DHParams {
  theta: number;  // 관절 각도
  d: number;      // 링크 오프셋
  a: number;      // 링크 길이
  alpha: number;  // 링크 비틀림
}

export function calculateFK(
  jointAngles: number[],
  dhParams: DHParams[]
): { position: THREE.Vector3; rotation: THREE.Euler } {
  let transform = new THREE.Matrix4();

  for (let i = 0; i < jointAngles.length; i++) {
    const T = dhTransform(
      jointAngles[i] + dhParams[i].theta,
      dhParams[i].d,
      dhParams[i].a,
      dhParams[i].alpha
    );
    transform.multiply(T);
  }

  const position = new THREE.Vector3();
  const rotation = new THREE.Euler();
  // ... extract from transform matrix

  return { position, rotation };
}
```

### Zustand 스토어 확장

```typescript
// lib/store/robotStore.ts
interface RobotStore {
  // 기존
  joints: JointState[];
  setJointAngle: (index: number, angle: number) => void;
  resetJoints: () => void;

  // 추가
  endEffectorPosition: Vector3;
  endEffectorRotation: Euler;
  activeJoint: number | null;
  setActiveJoint: (index: number | null) => void;
  updateEndEffector: () => void;
}
```

---

## UI 컴포넌트 스펙

### JointSlider

```typescript
interface JointSliderProps {
  joint: JointState;
  index: number;
  isActive: boolean;
  onAngleChange: (angle: number) => void;
  onHover: (hovering: boolean) => void;
}
```

**스타일:**
- 높이: 48px
- 슬라이더 트랙: 8px
- 슬라이더 썸: 20px 원형
- 관절 색상 인디케이터: 좌측 8px 세로 바

### PositionDisplay

```typescript
interface PositionDisplayProps {
  position: Vector3;
  rotation: Euler;
}
```

**스타일:**
- 카드 형태
- 모노스페이스 폰트
- 실시간 업데이트 (requestAnimationFrame)

---

## 완료 체크리스트

- [ ] 관절 슬라이더 UI 구현
- [ ] 슬라이더-3D 모델 연동
- [ ] FK 계산 구현
- [ ] 엔드 이펙터 위치 표시
- [ ] 관절 제한 시각화
- [ ] 관절 하이라이트 연동

---

## 다음 단계 (Phase 3 예고)

Phase 3에서는 IK 모드를 구현합니다:
- 3D 공간에서 목표점 지정
- 역기구학 계산으로 관절 각도 산출
- 목표점까지 부드러운 이동

---

*문서 버전: 1.0*
*최종 수정: 2026-01-29*
