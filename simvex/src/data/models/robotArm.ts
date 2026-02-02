import { ModelConfig } from '@/types/viewer';

export const robotArmModel: ModelConfig = {
  id: 'robot-arm',
  name: 'Industrial Robot Arm',
  nameKo: '산업용 로봇 암',
  description: '6축 다관절 로봇 암은 산업 자동화에서 용접, 조립, 이송 등 다양한 작업에 사용됩니다.',
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
  basePath: '/models/robot-arm',
  cameraPosition: [0.5, 0.4, 0.5],
  cameraTarget: [0, 0.15, 0],
  parts: [
    {
      id: 'base',
      glbFile: 'base.glb',
      name: 'Base',
      nameKo: '베이스',
      description: '로봇 암을 지면에 고정하는 기초 부품입니다. 첫 번째 회전축(Axis 1)이 위치합니다.',
      material: '주철',
      assemblyPosition: [0, 0, 0],
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.1,
      color: '#303030',
    },
    {
      id: 'shoulder',
      glbFile: 'part2.glb',
      name: 'Shoulder',
      nameKo: '숄더 (어깨)',
      description: '두 번째 관절로, 로봇 암의 전후 기울기를 제어합니다. Axis 2가 위치합니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0.05, 0],
      explodeDirection: [0, 1, 0],
      explodeDistance: 0.12,
      color: '#CC3333',
    },
    {
      id: 'upper-arm',
      glbFile: 'part3.glb',
      name: 'Upper Arm',
      nameKo: '상완부',
      description: '주요 리치(reach)를 담당하는 링크입니다. 큰 토크를 견딜 수 있도록 설계됩니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0.12, 0],
      explodeDirection: [0.2, 1, 0],
      explodeDistance: 0.15,
      color: '#CC3333',
    },
    {
      id: 'elbow',
      glbFile: 'part4.glb',
      name: 'Elbow',
      nameKo: '엘보 (팔꿈치)',
      description: '세 번째 관절입니다. 상완과 하완을 연결하며 Axis 3가 위치합니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0.2, 0],
      explodeDirection: [0.3, 0.8, 0],
      explodeDistance: 0.15,
      color: '#CC3333',
    },
    {
      id: 'forearm',
      glbFile: 'part5.glb',
      name: 'Forearm',
      nameKo: '하완부',
      description: '손목 관절을 지지하는 링크입니다. 내부에 Axis 4 모터가 있습니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0.28, 0],
      explodeDirection: [0.4, 0.6, 0],
      explodeDistance: 0.18,
      color: '#C0C0C0',
    },
    {
      id: 'wrist-pitch',
      glbFile: 'part6.glb',
      name: 'Wrist Pitch',
      nameKo: '손목 피치',
      description: '손목의 상하 기울기를 제어하는 Axis 5입니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0.35, 0],
      explodeDirection: [0.5, 0.4, 0],
      explodeDistance: 0.15,
      color: '#CC3333',
    },
    {
      id: 'wrist-roll',
      glbFile: 'part7.glb',
      name: 'Wrist Roll',
      nameKo: '손목 롤',
      description: '손목의 회전을 제어하는 Axis 6입니다. 말단 장치의 방향을 정밀하게 조절합니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0.4, 0],
      explodeDirection: [0.6, 0.3, 0],
      explodeDistance: 0.12,
      color: '#C0C0C0',
    },
    {
      id: 'end-effector',
      glbFile: 'part8.glb',
      name: 'End Effector Mount',
      nameKo: '말단 장치 마운트',
      description: '그리퍼, 용접 토치 등 다양한 말단 장치를 장착하는 플랜지입니다.',
      material: '스테인리스강',
      assemblyPosition: [0, 0.45, 0],
      explodeDirection: [0.7, 0.2, 0],
      explodeDistance: 0.1,
      color: '#606060',
    },
  ],
};
