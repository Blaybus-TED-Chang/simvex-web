import { ModelConfig } from '@/types/viewer';

export const leafSpringModel: ModelConfig = {
  id: 'leaf-spring',
  name: 'Leaf Spring Suspension',
  nameKo: '판스프링 서스펜션',
  description: '여러 장의 판 스프링이 겹쳐진 구조로, 트럭과 상용차에서 널리 사용되는 서스펜션 시스템입니다.',
  theory: `판스프링의 작동 원리:

1. 탄성 변형: 하중이 가해지면 판이 휘어지며 에너지를 저장합니다.
   - 각 판이 독립적으로 변형하여 충격을 분산

2. 층간 마찰: 판들 사이의 마찰이 진동을 감쇠시킵니다.
   - 별도의 댐퍼 없이도 감쇠 효과 발생
   - 마찰력 조절을 위한 중간 삽입재 사용

3. 스프링 상수:
   - 단일 판: k = (Ebt³)/(4L³)
   - 다층 판: k_total = n × k (n: 판 수, 단순화)
   (E: 탄성계수, b: 폭, t: 두께, L: 길이)

4. 설계 특징:
   - 점진적 스프링율: 하중에 따라 유효 길이 변화
   - 자체 감쇠: 마찰에 의한 에너지 소산
   - 높은 하중 지지력: 트럭, 버스에 적합`,
  category: '자동차',
  thumbnail: '/models/leaf-spring/thumbnail.png',
  basePath: '/models/leaf-spring',
  cameraPosition: [0.5, 0.3, 0.4],
  cameraTarget: [0, 0, 0],
  parts: [
    {
      id: 'leaf-layer',
      glbFile: 'leaf-layer.glb',
      name: 'Leaf Spring Pack',
      nameKo: '판스프링 팩',
      description: '여러 장의 판 스프링이 겹쳐진 핵심 부품입니다. 가장 긴 판이 메인 리프입니다.',
      material: '스프링 강',
      assemblyPosition: [0, 0, 0],
      explodeDirection: [0, 0, 0],
      explodeDistance: 0,
      color: '#404040',
    },
    {
      id: 'clamp-center',
      glbFile: 'clamp-center.glb',
      name: 'Center Clamp',
      nameKo: '센터 클램프',
      description: '판스프링 중앙을 고정하는 U볼트 클램프입니다. 액슬에 연결됩니다.',
      material: '강철',
      assemblyPosition: [0, 0.02, 0],
      explodeDirection: [0, 1, 0],
      explodeDistance: 0.1,
      color: '#606060',
    },
    {
      id: 'clamp-primary',
      glbFile: 'clamp-primary.glb',
      name: 'Primary Clamp',
      nameKo: '1차 클램프',
      description: '판스프링 전단부를 고정하는 클램프입니다.',
      material: '강철',
      assemblyPosition: [0.15, 0.01, 0],
      explodeDirection: [1, 0.5, 0],
      explodeDistance: 0.12,
      color: '#808080',
    },
    {
      id: 'clamp-secondary',
      glbFile: 'clamp-secondary.glb',
      name: 'Secondary Clamp',
      nameKo: '2차 클램프',
      description: '판스프링 후단부를 고정하는 클램프입니다.',
      material: '강철',
      assemblyPosition: [-0.15, 0.01, 0],
      explodeDirection: [-1, 0.5, 0],
      explodeDistance: 0.12,
      color: '#808080',
    },
    {
      id: 'support',
      glbFile: 'support.glb',
      name: 'Spring Hanger',
      nameKo: '스프링 행거',
      description: '판스프링의 앞쪽 끝을 차체 프레임에 연결하는 브라켓입니다.',
      material: '주철',
      assemblyPosition: [0.2, 0.03, 0],
      explodeDirection: [1, 0.3, 0],
      explodeDistance: 0.15,
      color: '#A0A0A0',
    },
    {
      id: 'support-chassis',
      glbFile: 'support-chassis.glb',
      name: 'Chassis Mount',
      nameKo: '샤시 마운트',
      description: '스프링 행거를 차체 프레임에 고정하는 마운트입니다.',
      material: '주철',
      assemblyPosition: [0.22, 0.05, 0],
      explodeDirection: [1, 0.5, 0],
      explodeDistance: 0.1,
      color: '#C0C0C0',
    },
    {
      id: 'support-chassis-rigid',
      glbFile: 'support-chassis-rigid.glb',
      name: 'Rigid Chassis Mount',
      nameKo: '고정 샤시 마운트',
      description: '후단의 고정형 마운트입니다. 피벗 운동 없이 고정됩니다.',
      material: '주철',
      assemblyPosition: [-0.22, 0.05, 0],
      explodeDirection: [-1, 0.5, 0],
      explodeDistance: 0.1,
      color: '#C0C0C0',
    },
    {
      id: 'support-rubber',
      glbFile: 'support-rubber.glb',
      name: 'Rubber Bushing',
      nameKo: '러버 부싱',
      description: '금속 간 충격을 흡수하는 고무 부싱입니다. 소음과 진동을 감소시킵니다.',
      material: '고무',
      assemblyPosition: [0.18, 0.02, 0],
      explodeDirection: [0.8, 0.3, 0.2],
      explodeDistance: 0.08,
      color: '#303030',
    },
    {
      id: 'support-rubber-60mm',
      glbFile: 'support-rubber-60mm.glb',
      name: 'Large Rubber Bushing',
      nameKo: '대형 러버 부싱 (60mm)',
      description: '큰 하중을 견디는 60mm 직경의 러버 부싱입니다.',
      material: '고무',
      assemblyPosition: [-0.18, 0.02, 0],
      explodeDirection: [-0.8, 0.3, 0.2],
      explodeDistance: 0.08,
      color: '#303030',
    },
  ],
};
