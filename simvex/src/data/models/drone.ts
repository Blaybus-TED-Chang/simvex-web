import { ModelConfig } from '@/types/viewer';

export const droneModel: ModelConfig = {
  id: 'drone',
  name: 'Quadcopter Drone',
  nameKo: '쿼드콥터 드론',
  description: '4개의 프로펠러로 비행하는 멀티콥터 드론입니다. 항공 촬영, 배송, 농업 등 다양한 분야에서 활용됩니다.',
  theory: `쿼드콥터 드론의 비행 원리:

1. 양력 생성: 프로펠러가 회전하며 공기를 아래로 밀어 양력을 생성합니다.
   - 양력 = ½ × ρ × v² × A × Cl

2. 비행 제어:
   - 상승/하강: 4개 모터 동시 가감속
   - 전진/후진(피치): 전/후 모터 속도 차이
   - 좌우 이동(롤): 좌/우 모터 속도 차이
   - 회전(요): 대각선 모터 쌍의 속도 차이

3. 안정화 시스템:
   - IMU(관성 측정 장치): 자이로스코프 + 가속도계
   - PID 제어: 목표 자세와 현재 자세의 오차를 최소화

4. 관련 공식:
   - 추력: T = Ct × ρ × n² × D⁴
   - 토크: Q = Cq × ρ × n² × D⁵
   (Ct, Cq: 추력/토크 계수, n: 회전수, D: 프로펠러 직경)`,
  category: '항공',
  thumbnail: '/models/drone/thumbnail.png',
  basePath: '/models/drone',
  cameraPosition: [0.4, 0.3, 0.4],
  cameraTarget: [0, 0, 0],
  parts: [
    {
      id: 'main-frame',
      glbFile: 'main-frame.glb',
      name: 'Main Frame',
      nameKo: '메인 프레임',
      description: '드론의 중앙 몸체로, 배터리와 전자 장비가 탑재됩니다.',
      material: '카본 파이버',
      assemblyPosition: [0, 0.02, 0],
      assemblyRotation: [90, 180, 90],
      explodeDirection: [0, 0, 0],
      explodeDistance: 0,
      color: '#CC3333',
    },
    {
      id: 'main-frame-mir',
      glbFile: 'main-frame-mir.glb',
      name: 'Frame Cover',
      nameKo: '프레임 커버',
      description: '메인 프레임의 상단 커버로, 내부 부품을 보호합니다.',
      material: '카본 파이버',
      assemblyPosition: [0, 0.02, 0],
      assemblyRotation: [90, 180, 90],
      explodeDirection: [0, 1, 0],
      explodeDistance: 0.12,
      color: '#808080',
    },
    {
      id: 'arm-gear',
      glbFile: 'arm-gear.glb',
      name: 'Motor Arm',
      nameKo: '모터 암',
      description: '모터를 프레임에 연결하는 팔 구조물입니다. 접이식 설계로 휴대가 편리합니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0.08, 0, 0],
      assemblyRotation: [0, 0, 0],
      explodeDirection: [1, 0, 0],
      explodeDistance: 0.15,
      color: '#404040',
    },
    {
      id: 'leg',
      glbFile: 'leg.glb',
      name: 'Landing Leg',
      nameKo: '랜딩 기어',
      description: '착륙 시 충격을 흡수하고 드론을 지지하는 다리입니다.',
      material: '카본 파이버',
      assemblyPosition: [-0.015, -0.05, 0],
      assemblyRotation: [0, 150, 0],
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.12,
      color: '#303030',
    },
    {
      id: 'gearing',
      glbFile: 'gearing.glb',
      name: 'Motor Mount Gear',
      nameKo: '모터 마운트 기어',
      description: '접이식 암의 힌지 부분에 있는 기어 메커니즘입니다.',
      material: '강화 플라스틱',
      assemblyPosition: [0.05, 0.01, 0],
      explodeDirection: [0.5, 0.5, 0],
      explodeDistance: 0.08,
      color: '#505050',
    },
    {
      id: 'beater-disc',
      glbFile: 'beater-disc.glb',
      name: 'Motor Housing',
      nameKo: '모터 하우징',
      description: '브러시리스 모터를 감싸는 하우징입니다. 방열 기능을 합니다.',
      material: '알루미늄',
      assemblyPosition: [0.12, 0.02, 0],
      explodeDirection: [1, 0.3, 0],
      explodeDistance: 0.1,
      color: '#606060',
    },
    {
      id: 'impeller-blade',
      glbFile: 'impeller-blade.glb',
      name: 'Propeller',
      nameKo: '프로펠러',
      description: '회전하여 양력을 생성하는 핵심 부품입니다. 피치와 직경에 따라 성능이 결정됩니다.',
      material: '카본 파이버 강화 플라스틱',
      assemblyPosition: [0.12, 0.05, 0],
      explodeDirection: [1, 1, 0],
      explodeDistance: 0.15,
      color: '#202020',
    },
    {
      id: 'nut',
      glbFile: 'nut.glb',
      name: 'Propeller Nut',
      nameKo: '프로펠러 너트',
      description: '프로펠러를 모터축에 고정하는 너트입니다. 풀림 방지 설계가 적용됩니다.',
      material: '알루미늄',
      assemblyPosition: [0.12, 0.06, 0],
      explodeDirection: [1, 1.2, 0],
      explodeDistance: 0.08,
      color: '#A0A0A0',
    },
    {
      id: 'screw',
      glbFile: 'screw.glb',
      name: 'Assembly Screw',
      nameKo: '조립 나사',
      description: '각 부품을 조립하는 나사입니다.',
      material: '스테인리스강',
      assemblyPosition: [0.03, 0.01, 0.03],
      explodeDirection: [0.3, 0.8, 0.3],
      explodeDistance: 0.06,
      color: '#808080',
    },
    {
      id: 'xyz',
      glbFile: 'xyz.glb',
      name: 'Camera Gimbal Mount',
      nameKo: '카메라 짐벌 마운트',
      description: '카메라나 짐벌을 장착하는 마운트입니다.',
      material: '알루미늄',
      assemblyPosition: [0, -0.03, 0.05],
      explodeDirection: [0, -0.5, 1],
      explodeDistance: 0.1,
      color: '#4040A0',
    },
  ],
};
