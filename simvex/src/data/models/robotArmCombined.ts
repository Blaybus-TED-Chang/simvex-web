import { CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';

export const robotArmCombinedModel: CombinedModelConfig = {
  id: 'robot-arm-combined',
  name: 'Industrial Robot Arm (Combined)',
  nameKo: '산업용 로봇 암 (통합)',
  description: '6축 다관절 로봇 암의 통합 3D 모델입니다. 하나의 GLB 파일에서 메시별로 분해/조립이 가능합니다.',
  theory: `로봇 암의 작동 원리:

1. 운동학(Kinematics): 각 관절의 회전각으로부터 말단 장치의 위치를 계산합니다.
   - 순운동학(FK): 관절각 → 말단 위치
   - 역운동학(IK): 목표 위치 → 관절각

2. 자유도(DOF): 6축 로봇은 6개의 자유도를 가져 3D 공간에서 임의의 위치와 방향으로 이동할 수 있습니다.

3. 작업 영역(Workspace): 로봇 암이 도달할 수 있는 모든 점들의 집합입니다.

4. 관련 공식:
   - DH 파라미터: 링크 간 변환 행렬
   - 야코비안: 말단 속도와 관절 속도의 관계
   - 토크: τ = J^T × F (J: 야코비안, F: 말단 힘)`,
  category: '로봇',
  thumbnail: '/models/robot-arm/thumbnail.png',
  glbPath: '/models/robot-arm-combined/robot-arm-combined.glb',
  scale: 0.1,
  cameraPosition: [0.5, 0.4, 0.5],
  cameraTarget: [0, 0.15, 0],
  parts: [
    // 베이스 (2 meshes: base2imagetostl_mesh0, mesh1)
    {
      id: 'base',
      meshName: 'base2imagetostl',
      name: 'Base',
      nameKo: '베이스',
      description: '로봇 암을 지면에 고정하는 기초 부품입니다. 첫 번째 회전축(Axis 1)이 위치합니다.',
      material: '주철',
      explodeDirection: [0, -1, 0],
      explodeDistance: 8.0,
      color: '#303030',
    },
    // 숄더 (3 meshes: Part9node_7b668f1c...mesh0/1/2)
    {
      id: 'shoulder',
      meshName: 'Part9node',
      name: 'Shoulder',
      nameKo: '숄더 (어깨)',
      description: '두 번째 관절로, 로봇 암의 전후 기울기를 제어합니다. Axis 2가 위치합니다.',
      material: '알루미늄 합금',
      explodeDirection: [1, 0.2, 0.5],
      explodeDistance: 10.0,
      color: '#CC3333',
    },
    // 상완부 (3 meshes: Part3node_7a612a2b...mesh0/1/2)
    {
      id: 'upper-arm',
      meshName: 'Part3node',
      name: 'Upper Arm',
      nameKo: '상완부',
      description: '주요 리치(reach)를 담당하는 링크입니다. 큰 토크를 견딜 수 있도록 설계됩니다.',
      material: '알루미늄 합금',
      explodeDirection: [-1, 0.5, 0],
      explodeDistance: 12.0,
      color: '#CC3333',
    },
    // 하완부 (2 meshes: Part5node_69ffda2b...mesh0/1)
    {
      id: 'forearm',
      meshName: 'Part5node',
      name: 'Forearm',
      nameKo: '하완부',
      description: '손목 관절을 지지하는 링크입니다. 내부에 Axis 4 모터가 있습니다.',
      material: '알루미늄 합금',
      explodeDirection: [0, 0.6, 1],
      explodeDistance: 14.0,
      color: '#C0C0C0',
    },
    // 엘보 (2 meshes: Part11node_6a73fd9e...mesh0/1)
    {
      id: 'elbow',
      meshName: 'Part11node',
      name: 'Elbow',
      nameKo: '엘보 (팔꿈치)',
      description: '세 번째 관절입니다. 상완과 하완을 연결하며 Axis 3가 위치합니다.',
      material: '알루미늄 합금',
      explodeDirection: [0.8, 0.4, -0.6],
      explodeDistance: 12.0,
      color: '#CC3333',
    },
    // 손목 피치 (2 meshes: Part6node_b30c6b41...mesh0/1)
    {
      id: 'wrist-pitch',
      meshName: 'Part6node',
      name: 'Wrist Pitch',
      nameKo: '손목 피치',
      description: '손목의 상하 기울기를 제어하는 Axis 5입니다.',
      material: '알루미늄 합금',
      explodeDirection: [-0.6, 0.3, -1],
      explodeDistance: 12.0,
      color: '#CC3333',
    },
    // 손목 롤 A (3 meshes: Part7node_00398de2...mesh0/1/2)
    {
      id: 'wrist-roll-a',
      meshName: 'Part7node_00398de2',
      name: 'Wrist Roll A',
      nameKo: '손목 롤 A',
      description: '손목의 회전을 제어하는 Axis 6입니다. 말단 장치의 방향을 정밀하게 조절합니다.',
      material: '알루미늄 합금',
      explodeDirection: [0.5, 1, 0.5],
      explodeDistance: 10.0,
      color: '#C0C0C0',
    },
    // 손목 롤 B (1 mesh: Part7node_e20e3ae6...mesh0)
    {
      id: 'wrist-roll-b',
      meshName: 'Part7node_e20e3ae6',
      name: 'Wrist Roll B',
      nameKo: '손목 롤 B',
      description: '손목 롤의 보조 구조물입니다.',
      material: '알루미늄 합금',
      explodeDirection: [-1, 0.3, 0.7],
      explodeDistance: 10.0,
      color: '#C0C0C0',
    },
    // 말단 장치 A (1 mesh: Part8node_85cff357...mesh0)
    {
      id: 'end-effector-a',
      meshName: 'Part8node',
      name: 'End Effector Mount A',
      nameKo: '말단 장치 A',
      description: '그리퍼, 용접 토치 등 다양한 말단 장치를 장착하는 플랜지입니다.',
      material: '스테인리스강',
      explodeDirection: [-0.5, 1, -0.5],
      explodeDistance: 10.0,
      color: '#606060',
    },
    // 말단 장치 B (1 mesh: node_85cff357...mesh0 - Part8 prefix 없음)
    {
      id: 'end-effector-b',
      meshName: 'node_85cff357',
      name: 'End Effector Mount B',
      nameKo: '말단 장치 B',
      description: '말단 장치의 보조 마운트입니다.',
      material: '스테인리스강',
      explodeDirection: [0.7, 0.5, -0.7],
      explodeDistance: 10.0,
      color: '#606060',
    },
  ],
};
