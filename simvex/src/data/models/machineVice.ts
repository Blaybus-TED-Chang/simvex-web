import { ModelConfig } from '@/types/viewer';

export const machineViceModel: ModelConfig = {
  id: 'machine-vice',
  name: 'Machine Vice',
  nameKo: '공작 기계 바이스',
  description: '공작 기계에서 가공물을 단단히 고정하는 장치입니다. 밀링, 드릴링 등의 정밀 가공에 필수적입니다.',
  theory: `공작 기계 바이스의 작동 원리:

1. 나사 메커니즘: 사다리꼴 나사(트래피지드 스크류)를 회전시켜 조(jaw)를 이동시킵니다.
   - 기계적 이득: MA = 2πr / p (r: 핸들 반경, p: 나사 피치)
   - 셀프 로킹: 나사 각도가 마찰각보다 작으면 자동 잠금

2. 클램핑력 계산:
   - F_clamp = T × (2π / p) × η
   (T: 토크, p: 피치, η: 효율)

3. 가이드 시스템:
   - 슬라이딩 가이드: 정밀한 직선 운동 보장
   - 기브(Gib) 조정: 유격 제거로 가공 정밀도 향상

4. 설계 요소:
   - 조(Jaw)의 경화 처리: 마모 저항성
   - 베이스의 T-슬롯: 공작 기계 테이블에 고정
   - 스위블 기능: 각도 조절 가능 (선택사양)`,
  category: '공작기계',
  thumbnail: '/models/machine-vice/thumbnail.png',
  basePath: '/models/machine-vice',
  cameraPosition: [0.3, 0.25, 0.3],
  cameraTarget: [0, 0.03, 0],
  parts: [
    {
      id: 'base-plate',
      glbFile: 'base-plate.glb',
      name: 'Base Plate',
      nameKo: '베이스 플레이트',
      description: '바이스의 기초가 되는 플레이트입니다. T-슬롯으로 공작 기계 테이블에 고정됩니다.',
      material: '주철',
      assemblyPosition: [0, 0, 0],
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.08,
      color: '#8B4513',
    },
    {
      id: 'body',
      glbFile: 'body.glb',
      name: 'Vice Body',
      nameKo: '바이스 본체',
      description: '바이스의 주요 구조물로, 가이드 레일과 고정 조가 일체화되어 있습니다.',
      material: '주철',
      assemblyPosition: [0, 0.02, 0],
      explodeDirection: [0, 0, 0],
      explodeDistance: 0,
      color: '#505050',
    },
    {
      id: 'fixed-jaw',
      glbFile: 'fixed-jaw.glb',
      name: 'Fixed Jaw',
      nameKo: '고정 조',
      description: '움직이지 않는 고정된 조입니다. 가공물의 기준면 역할을 합니다.',
      material: '공구강',
      assemblyPosition: [0, 0.04, 0.03],
      explodeDirection: [0, 0.3, 1],
      explodeDistance: 0.1,
      color: '#303030',
    },
    {
      id: 'movable-jaw',
      glbFile: 'movable-jaw.glb',
      name: 'Movable Jaw',
      nameKo: '이동 조',
      description: '스핀들에 의해 이동하는 조입니다. 가공물을 클램핑합니다.',
      material: '공구강',
      assemblyPosition: [0, 0.04, -0.03],
      explodeDirection: [0, 0.3, -1],
      explodeDistance: 0.12,
      color: '#303030',
    },
    {
      id: 'clamping-jaw',
      glbFile: 'clamping-jaw.glb',
      name: 'Soft Jaw',
      nameKo: '소프트 조',
      description: '교체 가능한 조 커버입니다. 가공물 표면 손상을 방지합니다.',
      material: '알루미늄/구리',
      assemblyPosition: [0, 0.05, -0.04],
      explodeDirection: [0, 0.5, -1],
      explodeDistance: 0.08,
      color: '#707070',
    },
    {
      id: 'guide',
      glbFile: 'guide.glb',
      name: 'Slide Guide',
      nameKo: '슬라이드 가이드',
      description: '이동 조의 직선 운동을 안내하는 가이드입니다.',
      material: '주철',
      assemblyPosition: [0, 0.02, -0.02],
      explodeDirection: [0.5, 0.3, -0.5],
      explodeDistance: 0.06,
      color: '#606060',
    },
    {
      id: 'guide-rail',
      glbFile: 'guide-rail.glb',
      name: 'Guide Rail',
      nameKo: '가이드 레일',
      description: '이동 조가 미끄러지는 정밀 가공된 레일입니다.',
      material: '경화강',
      assemblyPosition: [0, 0.015, -0.01],
      explodeDirection: [-0.5, 0.3, -0.3],
      explodeDistance: 0.05,
      color: '#808080',
    },
    {
      id: 'spindle',
      glbFile: 'spindle.glb',
      name: 'Lead Screw',
      nameKo: '리드 스크류',
      description: '사다리꼴 나사로, 회전 운동을 직선 운동으로 변환합니다.',
      material: '합금강',
      assemblyPosition: [0, 0.03, -0.06],
      explodeDirection: [0, 0, -1],
      explodeDistance: 0.15,
      color: '#B8860B',
    },
    {
      id: 'spindle-socket',
      glbFile: 'spindle-socket.glb',
      name: 'Spindle Housing',
      nameKo: '스핀들 하우징',
      description: '리드 스크류를 지지하고 회전축을 안내하는 하우징입니다.',
      material: '주철',
      assemblyPosition: [0, 0.03, -0.08],
      explodeDirection: [0, 0.2, -1],
      explodeDistance: 0.1,
      color: '#404040',
    },
    {
      id: 'pressure-sleeve',
      glbFile: 'pressure-sleeve.glb',
      name: 'Thrust Collar',
      nameKo: '추력 칼라',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      assemblyPosition: [0, 0.03, -0.1],
      explodeDirection: [0, 0.3, -1],
      explodeDistance: 0.08,
      color: '#DAA520',
    },
  ],
};
