import { CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';

export const leafSpringCombinedModel: CombinedModelConfig = {
  id: 'leaf-spring-combined',
  name: 'Leaf Spring Suspension (Combined)',
  nameKo: '판스프링 서스펜션 (통합)',
  description: '여러 장의 판 스프링이 겹쳐진 구조의 통합 3D 모델입니다. 트럭과 상용차에서 널리 사용되는 서스펜션 시스템입니다.',
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
  thumbnail: '/models/leaf-spring-combined/thumbnails/assembly-1.png',
  thumbnails: [
    '/models/leaf-spring-combined/thumbnails/assembly-1.png',
    '/models/leaf-spring-combined/thumbnails/assembly-2.png',
  ],
  glbPath: '/models/leaf-spring-combined/leaf-spring-combined.glb',
  scale: 0.1,
  cameraPosition: [0.11, 0.08, 0.11],
  cameraTarget: [0, 0, 0],
  parts: [
    // 판스프링 팩 (중심 부품, 분해 안함)
    {
      id: 'leaf-layer',
      meshName: 'Leaf_Layernode',
      name: 'Leaf Spring Pack',
      nameKo: '판스프링 팩',
      description: '여러 장의 판 스프링이 겹쳐진 핵심 부품입니다. 가장 긴 판이 메인 리프입니다.',
      material: '스프링 강',
      explodeDirection: [0, 0, 0],
      explodeDistance: 0,
      color: '#404040',
    },
    // 센터 클램프
    {
      id: 'clamp-center',
      meshName: 'Clamp_Centernode',
      name: 'Center Clamp',
      nameKo: '센터 클램프',
      description: '판스프링 중앙을 고정하는 U볼트 클램프입니다. 액슬에 연결됩니다.',
      material: '강철',
      explodeDirection: [0, 1, 0],
      explodeDistance: 0.8,
      color: '#606060',
    },
    // 1차 클램프 (전방)
    {
      id: 'clamp-primary',
      meshName: 'Clamp_Primarynode',
      name: 'Primary Clamp',
      nameKo: '1차 클램프 (전방)',
      description: '판스프링 전단부를 고정하는 클램프입니다.',
      material: '강철',
      explodeDirection: [1, 0.5, 0],
      explodeDistance: 1.0,
      color: '#808080',
    },
    // 2차 클램프 (후방)
    {
      id: 'clamp-secondary',
      meshName: 'Clamp_Secondarynode',
      name: 'Secondary Clamp',
      nameKo: '2차 클램프 (후방)',
      description: '판스프링 후단부를 고정하는 클램프입니다.',
      material: '강철',
      explodeDirection: [-1, 0.5, 0],
      explodeDistance: 1.0,
      color: '#808080',
    },
    // 러버 부싱 (앞쪽, 반드시 imagetostl_mesh0보다 먼저 매칭)
    {
      id: 'support-rubber',
      meshName: 'Support_Rubberimagetostl',
      name: 'Rubber Bushing',
      nameKo: '러버 부싱',
      description: '금속 간 충격을 흡수하는 고무 부싱입니다. 소음과 진동을 감소시킵니다.',
      material: '고무',
      explodeDirection: [0.8, 0.3, 0.5],
      explodeDistance: 0.8,
      color: '#303030',
    },
    // 대형 러버 부싱 60mm
    {
      id: 'support-rubber-60mm',
      meshName: 'Support_Rubber_60mm',
      name: 'Large Rubber Bushing (60mm)',
      nameKo: '대형 러버 부싱 (60mm)',
      description: '큰 하중을 견디는 60mm 직경의 러버 부싱입니다.',
      material: '고무',
      explodeDirection: [-0.8, 0.3, 0.5],
      explodeDistance: 0.8,
      color: '#303030',
    },
    // 스프링 행거 (앞쪽, 반드시 Support_Chassis보다 먼저 매칭)
    {
      id: 'support',
      meshName: 'Supportimagetostl',
      name: 'Spring Hanger',
      nameKo: '스프링 행거',
      description: '판스프링의 앞쪽 끝을 차체 프레임에 연결하는 브라켓입니다.',
      material: '주철',
      explodeDirection: [1, 0.3, 0],
      explodeDistance: 1.2,
      color: '#A0A0A0',
    },
    // 샤시 마운트 (반드시 Support_Chassis_Rigid보다 먼저 매칭)
    {
      id: 'support-chassis',
      meshName: 'Support_Chassisimagetostl',
      name: 'Chassis Mount',
      nameKo: '샤시 마운트',
      description: '스프링 행거를 차체 프레임에 고정하는 마운트입니다.',
      material: '주철',
      explodeDirection: [1, 0.5, -0.3],
      explodeDistance: 1.0,
      color: '#C0C0C0',
    },
    // 고정 샤시 마운트
    {
      id: 'support-chassis-rigid',
      meshName: 'Support_Chassis_Rigid',
      name: 'Rigid Chassis Mount',
      nameKo: '고정 샤시 마운트',
      description: '후단의 고정형 마운트입니다. 피벗 운동 없이 고정됩니다.',
      material: '주철',
      explodeDirection: [-1, 0.5, -0.3],
      explodeDistance: 1.0,
      color: '#C0C0C0',
    },
    // 1차 클램프 (후방 대칭) - 중복 부품
    {
      id: 'clamp-primary-rear',
      meshName: 'node_facb238d',
      name: 'Primary Clamp (Rear)',
      nameKo: '1차 클램프 (후방 대칭)',
      description: '판스프링 반대쪽을 고정하는 대칭 클램프입니다.',
      material: '강철',
      explodeDirection: [-1, 0.5, 0.3],
      explodeDistance: 1.0,
      color: '#808080',
    },
    // 2차 클램프 (전방 대칭) - 중복 부품
    {
      id: 'clamp-secondary-front',
      meshName: 'node_5c745b1b',
      name: 'Secondary Clamp (Front)',
      nameKo: '2차 클램프 (전방 대칭)',
      description: '판스프링 반대쪽을 고정하는 대칭 클램프입니다.',
      material: '강철',
      explodeDirection: [1, 0.5, -0.3],
      explodeDistance: 1.0,
      color: '#808080',
    },
    // 스프링 행거 (뒤쪽) - 중복 부품 (마지막에 배치하여 다른 Support* 매칭 방지)
    {
      id: 'support-rear',
      meshName: 'imagetostl_mesh0',
      name: 'Spring Hanger (Rear)',
      nameKo: '스프링 행거 (후방)',
      description: '판스프링의 뒤쪽 끝을 차체 프레임에 연결하는 브라켓입니다.',
      material: '주철',
      explodeDirection: [-1, 0.3, 0],
      explodeDistance: 1.2,
      color: '#A0A0A0',
    },
  ],
};
