import { ModelConfig } from '@/types/viewer';

export const suspensionModel: ModelConfig = {
  id: 'suspension',
  name: 'Suspension System',
  nameKo: '서스펜션 시스템',
  description: '자동차 서스펜션은 차체와 바퀴 사이에서 충격을 흡수하고 승차감을 향상시키는 핵심 부품입니다.',
  theory: `서스펜션의 원리:

1. 스프링(Spring): 도로의 충격을 흡수하여 탄성 에너지로 저장합니다. 스프링 상수(k)에 따라 강성이 결정됩니다.

2. 댐퍼(Damper/Shock Absorber): 스프링의 진동을 감쇠시켜 안정성을 제공합니다. 오일이 작은 구멍을 통과하며 운동 에너지를 열로 변환합니다.

3. 관련 공식:
   - 후크의 법칙: F = -kx (스프링 힘)
   - 감쇠력: F = -cv (댐퍼 힘)
   - 고유 진동수: ω = √(k/m)`,
  category: '자동차',
  thumbnail: '/models/suspension/thumbnails/assembly-1.png',
  thumbnails: ['/models/suspension/thumbnails/assembly-1.png'],
  basePath: '/models/suspension',
  cameraPosition: [0.5, 0.3, 0.5],
  cameraTarget: [0, 0, 0],
  parts: [
    {
      id: 'base',
      glbFile: 'BASE.glb',
      name: 'Top Mount',
      nameKo: '상단 마운트',
      description: '서스펜션을 차체에 연결하는 상단 고정 부품입니다. 진동이 차체로 전달되는 것을 최소화합니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0.102, 0],
      assemblyRotation: [180, 0, 0],
      explodeDirection: [0, 1, 0],
      explodeDistance: 0.25,
      color: '#A0A0A0',
    },
    {
      id: 'spring',
      glbFile: 'SPRING.glb',
      name: 'Coil Spring',
      nameKo: '코일 스프링',
      description: '충격을 흡수하는 핵심 부품입니다. 압축과 신장을 반복하며 탄성 에너지를 저장합니다.',
      material: '스프링 강',
      assemblyPosition: [0, 0, 0],
      explodeDirection: [0, 0, 0],
      explodeDistance: 0,
      color: '#4488FF',
    },
    {
      id: 'nit',
      glbFile: 'NIT.glb',
      name: 'Bottom Mount',
      nameKo: '하단 마운트',
      description: '서스펜션을 바퀴(휠 허브)에 연결하는 하단 고정 부품입니다.',
      material: '주철',
      assemblyPosition: [0, -0.01, 0],
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.15,
      color: '#606060',
    },
    {
      id: 'rod',
      glbFile: 'ROD.glb',
      name: 'Piston Rod',
      nameKo: '피스톤 로드',
      description: '댐퍼 내부의 피스톤과 연결된 로드입니다. 오일을 통해 진동을 감쇠시킵니다.',
      material: '크롬 도금 강철',
      assemblyPosition: [0, 0.015, 0],
      assemblyRotation: [180, 0, 0],
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.25,
      color: '#808080',
    },
  ],
};
