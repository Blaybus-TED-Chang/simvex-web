# SiMVEX - Robot Arm Simulator

## 프로젝트 개요

**SiMVEX**는 공대생을 위한 엔지니어링 통합 학습 플랫폼입니다. 첫 번째 모듈로 **로봇 암 시뮬레이터**를 개발합니다.

> "나만의 로봇 팔을 조작하고, 원리를 이해하세요"

### 프로젝트 정보

| 항목 | 내용 |
|------|------|
| 프로젝트명 | SiMVEX - Robot Arm Simulator |
| 유형 | 해커톤 프로젝트 |
| 마감일 | 2025년 2월 11일 |
| 개발 인원 | 1명 |
| 플랫폼 | 웹 애플리케이션 |
| 배포 | Vercel |

---

## 핵심 가치

### 1. 시각적 학습
- 3D로 로봇 암 구조와 동작 원리를 직관적으로 이해
- 관절별 움직임과 좌표 변환을 실시간 확인

### 2. 인터랙티브 실습
- 직접 조작하며 순기구학(FK) 체험
- 목표 위치 지정으로 역기구학(IK) 이해

### 3. 실무 연계
- 실제 산업용 로봇과 유사한 경로 프로그래밍
- 웨이포인트 기반 동작 시퀀스 설계

---

## 타겟 사용자

### Primary: 공대생
- 기계공학, 로봇공학, 메카트로닉스 전공
- 로봇 기구학 수업을 듣는 학생
- 이론은 배웠지만 실습 기회가 부족한 학생

### Secondary: 로봇 입문자
- 로봇에 관심 있는 비전공자
- 산업용 로봇 기초를 배우고 싶은 직장인

---

## 기술 스택

### Frontend
```
Next.js 14          - React 프레임워크 (App Router)
TypeScript          - 타입 안정성
Tailwind CSS        - 스타일링
Zustand             - 상태 관리
```

### 3D Graphics
```
Three.js            - 3D 렌더링 엔진
React Three Fiber   - React 선언적 Three.js
@react-three/drei   - 유틸리티 컴포넌트
```

### Deployment
```
Vercel              - 호스팅 및 CI/CD
```

---

## 로봇 암 구조

### 6축 로봇 암 (6-DOF)

```
        [Wrist 3] ─── End Effector (그리퍼)
            │
        [Wrist 2]
            │
        [Wrist 1]
            │
        [Elbow]
            │
        [Shoulder]
            │
        [Base] ─── 고정 베이스
```

### 각 관절 설명

| 관절 | 축 | 운동 | 역할 |
|------|-----|------|------|
| Base | J1 | 회전 (Yaw) | 좌우 회전 |
| Shoulder | J2 | 회전 (Pitch) | 전후 기울임 |
| Elbow | J3 | 회전 (Pitch) | 팔 굽힘 |
| Wrist 1 | J4 | 회전 (Pitch) | 손목 기울임 |
| Wrist 2 | J5 | 회전 (Roll) | 손목 회전 |
| Wrist 3 | J6 | 회전 (Yaw) | 그리퍼 방향 |

---

## 핵심 기능

### 1. 3D 뷰어
- 산업용 로봇 스타일의 3D 모델
- 자유로운 카메라 조작 (회전, 줌, 패닝)
- 관절별 색상 구분
- 그리드 및 좌표축 표시

### 2. 순기구학 (Forward Kinematics) 모드
- 각 관절 각도를 슬라이더로 조절
- 실시간 엔드 이펙터 위치 계산 및 표시
- 관절 각도 제한 적용

### 3. 역기구학 (Inverse Kinematics) 모드
- 3D 공간에서 목표 위치 지정
- 자동으로 관절 각도 계산
- 도달 불가능 영역 표시

### 4. 경로 프로그래밍
- 웨이포인트 저장 및 관리
- 경로 애니메이션 재생
- 엔드 이펙터 궤적 시각화

### 5. 학습 패널
- 로봇 구조 및 관절 설명
- FK/IK 개념 및 수식
- 단계별 튜토리얼

---

## UI 레이아웃

```
┌─────────────────────────────────────────────────────────────┐
│  SiMVEX - Robot Arm Simulator                    [🌙][📖]  │
├──────────────────────────────────┬──────────────────────────┤
│                                  │  [FK 모드] [IK 모드]     │
│                                  ├──────────────────────────┤
│                                  │  Joint Controls          │
│                                  │                          │
│         3D 뷰어                  │  J1 (Base)      45°     │
│      (로봇 암 렌더링)             │  [────●────────]        │
│                                  │                          │
│                                  │  J2 (Shoulder)  120°    │
│                                  │  [──────────●──]        │
│                                  │                          │
│                                  │  ...                     │
│                                  ├──────────────────────────┤
│                                  │  End Effector            │
│                                  │  X: 0.45m  Y: 0.32m     │
│                                  │  Z: 0.78m                │
├──────────────────────────────────┼──────────────────────────┤
│  [▶ Play] [⏸] [🔴 Rec]  Speed: 1x │  Waypoints: 3 saved     │
└──────────────────────────────────┴──────────────────────────┘
```

---

## 일정 개요

| 단계 | 기간 | 주요 목표 |
|------|------|----------|
| Phase 1 | 1/29 ~ 1/31 | 프로젝트 셋업, 3D 씬 구축 |
| Phase 2 | 2/1 ~ 2/3 | FK 모드 구현 |
| Phase 3 | 2/4 ~ 2/6 | IK 모드 구현 |
| Phase 4 | 2/7 ~ 2/8 | 경로 프로그래밍 |
| Phase 5 | 2/9 ~ 2/10 | 학습 패널, UI 폴리싱 |
| Phase 6 | 2/11 | 최종 테스트, 배포 |

---

## 발표 전략

### 스토리라인

1. **문제 제기** (30초)
   - "로봇 팔이 어떻게 움직이는지 궁금하셨나요?"
   - "책으로만 배우는 기구학, 와닿지 않죠?"

2. **솔루션 소개** (30초)
   - "SiMVEX로 직접 조작하고 이해하세요"
   - 핵심 기능 3가지 소개

3. **라이브 데모** (2분)
   - FK 모드: 슬라이더로 관절 조작
   - IK 모드: 목표점 클릭 → 자동 이동
   - 경로 프로그래밍: 웨이포인트 → 재생

4. **기술적 차별점** (30초)
   - 웹 기반 (설치 불필요)
   - 실시간 3D 시뮬레이션
   - 교육 콘텐츠 통합

5. **확장 가능성** (30초)
   - 다양한 로봇 모델 추가
   - 다른 시뮬레이션 모듈 (기어, 엔진 등)
   - 협업 기능

---

## 참고 자료

### 로봇 기구학
- [Robotics, Vision and Control (Peter Corke)](https://petercorke.com/rvc/)
- [Modern Robotics (Lynch & Park)](http://hades.mech.northwestern.edu/index.php/Modern_Robotics)

### Three.js / R3F
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber)
- [Drei Components](https://github.com/pmndrs/drei)
- [Three.js Examples](https://threejs.org/examples/)

### IK 구현
- [CCDIKSolver (Three.js)](https://threejs.org/docs/#examples/en/animations/CCDIKSolver)
- [FABRIK Algorithm](http://www.andreasaristidou.com/FABRIK.html)

---

## 팀 논의 사항

> 기획 변경 시 이 섹션 업데이트

- [ ] 로봇 암 디자인 스타일 결정
- [ ] 학습 콘텐츠 범위 결정
- [ ] 추가 기능 우선순위 논의

---

*문서 버전: 1.0*
*최종 수정: 2026-01-29*
