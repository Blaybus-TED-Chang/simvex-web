import { ModelConfig } from '@/types/viewer';

export const v4EngineModel: ModelConfig = {
  id: 'v4-engine',
  name: 'V4 Cylinder Engine',
  nameKo: 'V4 실린더 엔진',
  description: 'V4 실린더 엔진은 4개의 실린더가 V자 형태로 배열된 내연기관입니다. 자동차와 오토바이에서 널리 사용됩니다.',
  theory: `V4 엔진의 작동 원리:

1. 4행정 사이클: 흡입 → 압축 → 폭발 → 배기의 4단계로 동력을 생성합니다.

2. 크랭크샤프트(Crankshaft): 피스톤의 직선 왕복 운동을 회전 운동으로 변환합니다.

3. 커넥팅 로드(Connecting Rod): 피스톤과 크랭크샤프트를 연결하여 힘을 전달합니다.

4. 관련 공식:
   - 배기량: V = (π/4) × D² × S × n (D: 실린더 직경, S: 행정, n: 실린더 수)
   - 압축비: r = (V₁ + V₂) / V₂ (V₁: 행정 체적, V₂: 연소실 체적)
   - 토크: T = F × r (F: 폭발력, r: 크랭크 반경)`,
  category: '자동차',
  thumbnail: '/models/v4-engine/thumbnail.png',
  basePath: '/models/v4-engine',
  cameraPosition: [0.4, 0.3, 0.4],
  cameraTarget: [0, 0, 0],
  parts: [
    {
      id: 'crankshaft',
      glbFile: 'crankshaft.glb',
      name: 'Crankshaft',
      nameKo: '크랭크샤프트',
      description: '피스톤의 직선 왕복 운동을 회전 운동으로 변환하는 핵심 부품입니다. 엔진의 출력축 역할을 합니다.',
      material: '단조강',
      assemblyPosition: [0, 0, 0],
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.15,
      color: '#808080',
    },
    {
      id: 'piston',
      glbFile: 'piston.glb',
      name: 'Piston',
      nameKo: '피스톤',
      description: '실린더 내에서 왕복 운동하며 연소 가스의 압력을 받아 동력을 전달합니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0.08, 0],
      explodeDirection: [0, 1, 0],
      explodeDistance: 0.2,
      color: '#A0A0A0',
    },
    {
      id: 'piston-ring',
      glbFile: 'piston-ring.glb',
      name: 'Piston Ring',
      nameKo: '피스톤 링',
      description: '피스톤과 실린더 벽 사이의 기밀을 유지하고 오일을 조절합니다.',
      material: '주철',
      assemblyPosition: [0, 0.085, 0],
      explodeDirection: [0, 1, 0.3],
      explodeDistance: 0.25,
      color: '#606060',
    },
    {
      id: 'piston-pin',
      glbFile: 'piston-pin.glb',
      name: 'Piston Pin',
      nameKo: '피스톤 핀',
      description: '피스톤과 커넥팅 로드를 연결하는 핀입니다. 구스드 핀(Gudgeon Pin)이라고도 합니다.',
      material: '크롬강',
      assemblyPosition: [0, 0.06, 0],
      explodeDirection: [1, 0.5, 0],
      explodeDistance: 0.15,
      color: '#C0C0C0',
    },
    {
      id: 'connecting-rod',
      glbFile: 'connecting-rod.glb',
      name: 'Connecting Rod',
      nameKo: '커넥팅 로드',
      description: '피스톤의 왕복 운동을 크랭크샤프트의 회전 운동으로 전달하는 연결 부품입니다.',
      material: '단조강',
      assemblyPosition: [0, 0.04, 0],
      explodeDirection: [0.3, 0.5, 0],
      explodeDistance: 0.18,
      color: '#707070',
    },
    {
      id: 'connecting-rod-cap',
      glbFile: 'connecting-rod-cap.glb',
      name: 'Connecting Rod Cap',
      nameKo: '커넥팅 로드 캡',
      description: '커넥팅 로드의 빅엔드를 크랭크샤프트에 고정하는 캡입니다.',
      material: '단조강',
      assemblyPosition: [0, 0.02, 0],
      explodeDirection: [0, -0.5, 0.3],
      explodeDistance: 0.12,
      color: '#505050',
    },
    {
      id: 'conrod-bolt',
      glbFile: 'conrod-bolt.glb',
      name: 'Conrod Bolt',
      nameKo: '커넥팅 로드 볼트',
      description: '커넥팅 로드와 캡을 단단히 체결하는 고강도 볼트입니다.',
      material: '합금강',
      assemblyPosition: [0, 0.01, 0],
      explodeDirection: [-0.3, -0.5, 0],
      explodeDistance: 0.1,
      color: '#303030',
    },
  ],
};
