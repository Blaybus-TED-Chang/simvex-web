import { CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';

export const machineViceCombinedModel: CombinedModelConfig = {
  id: 'machine-vice-combined',
  name: 'Machine Vice (Combined)',
  nameKo: '공작 기계 바이스 (통합)',
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
  thumbnail: '/models/machine-vice-combined/thumbnails/assembly-1.jpg',
  thumbnails: [
    '/models/machine-vice-combined/thumbnails/assembly-1.jpg',
    '/models/machine-vice-combined/thumbnails/assembly-2.png',
  ],
  glbPath: '/models/machine-vice-combined/machine-vice-combined.glb',
  cameraPosition: [0.3, 0.25, 0.3],
  cameraTarget: [0, 0.03, 0],
  parts: [
    // ── 베이스 ──
    {
      id: 'base-plate',
      meshName: 'Part8_grundplatteimagetostl_mesh0',
      name: 'Base Plate',
      nameKo: '베이스 플레이트',
      description: '바이스의 기초가 되는 플레이트입니다. T-슬롯으로 공작 기계 테이블에 고정됩니다.',
      material: '주철',
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.08,
      color: '#8B4513',
    },
    // ── 가이드 ──
    {
      id: 'guide',
      meshName: 'Part1_Fuhrungimagetostl_mesh0',
      name: 'Slide Guide',
      nameKo: '슬라이드 가이드',
      description: '이동 조의 직선 운동을 안내하는 가이드입니다.',
      material: '주철',
      explodeDirection: [0.5, 0.3, -0.5],
      explodeDistance: 0.06,
      color: '#606060',
    },
    // ── 고정 조 ──
    {
      id: 'fixed-jaw',
      meshName: 'Part2_Feste_Backeimagetostl_mesh0',
      name: 'Fixed Jaw',
      nameKo: '고정 조',
      description: '움직이지 않는 고정된 조입니다. 가공물의 기준면 역할을 합니다.',
      material: '공구강',
      explodeDirection: [0, 0.3, 1],
      explodeDistance: 0.1,
      color: '#303030',
    },
    // ── 이동 조 ──
    {
      id: 'movable-jaw',
      meshName: 'Part3_lose_backeimagetostl_mesh0',
      name: 'Movable Jaw',
      nameKo: '이동 조',
      description: '스핀들에 의해 이동하는 조입니다. 가공물을 클램핑합니다.',
      material: '공구강',
      explodeDirection: [0, 0.3, -1],
      explodeDistance: 0.12,
      color: '#303030',
    },
    // ── 클램핑 조 ×2 ──
    {
      id: 'clamping-jaw-1',
      meshName: 'Part5_Spannbackeimagetostl_mesh0',
      name: 'Clamping Jaw 1',
      nameKo: '클램핑 조 1',
      description: '교체 가능한 조 커버입니다. 가공물 표면 손상을 방지합니다.',
      material: '알루미늄/구리',
      explodeDirection: [0, 0.5, 1],
      explodeDistance: 0.08,
      color: '#707070',
    },
    {
      id: 'clamping-jaw-2',
      meshName: 'Part5_Spannbacke2imagetostl_mesh0',
      name: 'Clamping Jaw 2',
      nameKo: '클램핑 조 2',
      description: '교체 가능한 조 커버입니다. 가공물 표면 손상을 방지합니다.',
      material: '알루미늄/구리',
      explodeDirection: [0, 0.5, -1],
      explodeDistance: 0.08,
      color: '#707070',
    },
    // ── 리드 스크류 ──
    {
      id: 'lead-screw',
      meshName: 'Part7_TrapezSpindelimagetostl_mesh0',
      name: 'Lead Screw',
      nameKo: '리드 스크류',
      description: '사다리꼴 나사로, 회전 운동을 직선 운동으로 변환합니다.',
      material: '합금강',
      explodeDirection: [0, 0, -1],
      explodeDistance: 0.15,
      color: '#B8860B',
    },
    // ── 스핀들 소켓 ──
    {
      id: 'spindle-socket',
      meshName: 'Part4_spindelsockelimagetostl_mesh0',
      name: 'Spindle Socket',
      nameKo: '스핀들 소켓',
      description: '리드 스크류를 지지하고 회전축을 안내하는 하우징입니다.',
      material: '주철',
      explodeDirection: [0, 0.2, -1],
      explodeDistance: 0.1,
      color: '#404040',
    },
    // ── 추력 칼라 ×11 ──
    {
      id: 'thrust-collar-1',
      meshName: 'Part9_Druckhulseimagetostl_mesh0',
      name: 'Thrust Collar 1',
      nameKo: '추력 칼라 1',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [0, 0.3, -1],
      explodeDistance: 0.08,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-2',
      meshName: 'Part9_Druckhulse2imagetostl_mesh0',
      name: 'Thrust Collar 2',
      nameKo: '추력 칼라 2',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [0.2, 0.3, -1],
      explodeDistance: 0.08,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-3',
      meshName: 'Part9_Druckhulse3imagetostl_mesh0',
      name: 'Thrust Collar 3',
      nameKo: '추력 칼라 3',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [-0.2, 0.3, -1],
      explodeDistance: 0.08,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-4',
      meshName: 'Part9_Druckhulse4imagetostl_mesh0',
      name: 'Thrust Collar 4',
      nameKo: '추력 칼라 4',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [0.3, 0.2, -1],
      explodeDistance: 0.09,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-5',
      meshName: 'Part9_Druckhulse5imagetostl_mesh0',
      name: 'Thrust Collar 5',
      nameKo: '추력 칼라 5',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [-0.3, 0.2, -1],
      explodeDistance: 0.09,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-6',
      meshName: 'Part9_Druckhulse6imagetostl_mesh0',
      name: 'Thrust Collar 6',
      nameKo: '추력 칼라 6',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [0, 0.4, -1],
      explodeDistance: 0.09,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-7',
      meshName: 'Part9_Druckhulse7imagetostl_mesh0',
      name: 'Thrust Collar 7',
      nameKo: '추력 칼라 7',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [0.2, 0.4, -1],
      explodeDistance: 0.09,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-8',
      meshName: 'Part9_Druckhulse8imagetostl_mesh0',
      name: 'Thrust Collar 8',
      nameKo: '추력 칼라 8',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [-0.2, 0.4, -1],
      explodeDistance: 0.09,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-9',
      meshName: 'Part9_Druckhulse9imagetostl_mesh0',
      name: 'Thrust Collar 9',
      nameKo: '추력 칼라 9',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [0.3, 0.3, -1],
      explodeDistance: 0.1,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-10',
      meshName: 'Part9_Druckhulse10imagetostl_mesh0',
      name: 'Thrust Collar 10',
      nameKo: '추력 칼라 10',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [-0.3, 0.3, -1],
      explodeDistance: 0.1,
      color: '#DAA520',
    },
    {
      id: 'thrust-collar-11',
      meshName: 'Part9_Druckhulse11imagetostl_mesh0',
      name: 'Thrust Collar 11',
      nameKo: '추력 칼라 11',
      description: '리드 스크류의 축방향 하중을 지지하는 칼라입니다.',
      material: '황동',
      explodeDirection: [0, 0.5, -1],
      explodeDistance: 0.1,
      color: '#DAA520',
    },
  ],
};
