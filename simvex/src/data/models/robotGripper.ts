import { ModelConfig } from '@/types/viewer';

export const robotGripperModel: ModelConfig = {
  id: 'robot-gripper',
  name: 'Robot Gripper',
  nameKo: '로봇 그리퍼 (집게)',
  description: '기어 연동 방식의 로봇 그리퍼는 물체를 집고 이동시키는 말단 장치입니다. 산업용 로봇의 핵심 부품입니다.',
  theory: `로봇 그리퍼의 작동 원리:

1. 기어 연동 메커니즘: 하나의 모터로 양쪽 집게를 동시에 구동합니다.
   - 동기화된 움직임으로 물체 중심을 자동으로 맞춤
   - 기어비에 따라 파지력과 속도가 결정됨

2. 파지력 계산:
   - F_grip = (τ × G) / r_finger (τ: 모터 토크, G: 기어비, r_finger: 핑거 반경)
   - 마찰력: F_friction = μ × F_normal

3. 그리퍼 종류:
   - 2핑거/3핑거 그리퍼
   - 평행 그리퍼 vs 각도 그리퍼
   - 소프트 그리퍼 (유연한 재질)

4. 설계 고려사항:
   - 파지 범위 (최소/최대 개구량)
   - 파지력 vs 정밀도
   - 물체 형상에 따른 핑거 설계`,
  category: '로봇',
  thumbnail: '/models/robot-gripper/thumbnail.png',
  basePath: '/models/robot-gripper',
  cameraPosition: [0.3, 0.2, 0.3],
  cameraTarget: [0, 0, 0],
  parts: [
    {
      id: 'base-plate',
      glbFile: 'base-plate.glb',
      name: 'Base Plate',
      nameKo: '베이스 플레이트',
      description: '그리퍼의 기초 구조물로, 로봇 암에 장착되는 부분입니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0, 0],
      explodeDirection: [0, 0, -1],
      explodeDistance: 0.1,
      color: '#6666CC',
    },
    {
      id: 'base-mounting-bracket',
      glbFile: 'base-mounting-bracket.glb',
      name: 'Mounting Bracket',
      nameKo: '마운팅 브라켓',
      description: '베이스 플레이트를 로봇 암 플랜지에 연결하는 브라켓입니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, 0, 0.02],
      explodeDirection: [0, 0, 1],
      explodeDistance: 0.08,
      color: '#6666CC',
    },
    {
      id: 'base-gear',
      glbFile: 'base-gear.glb',
      name: 'Drive Gear',
      nameKo: '구동 기어',
      description: '모터에서 동력을 받아 링크를 구동하는 메인 기어입니다.',
      material: '강화 플라스틱',
      assemblyPosition: [0, 0, 0.01],
      explodeDirection: [0, 0, 1],
      explodeDistance: 0.12,
      color: '#333333',
    },
    {
      id: 'gear-link-1',
      glbFile: 'gear-link-1.glb',
      name: 'Gear Link 1',
      nameKo: '기어 링크 1',
      description: '구동 기어와 맞물려 회전하는 첫 번째 연동 기어입니다.',
      material: '강화 플라스틱',
      assemblyPosition: [0.02, 0, 0],
      explodeDirection: [1, 0.3, 0],
      explodeDistance: 0.1,
      color: '#CC6633',
    },
    {
      id: 'gear-link-2',
      glbFile: 'gear-link-2.glb',
      name: 'Gear Link 2',
      nameKo: '기어 링크 2',
      description: '반대쪽 핑거를 구동하는 두 번째 연동 기어입니다.',
      material: '강화 플라스틱',
      assemblyPosition: [-0.02, 0, 0],
      explodeDirection: [-1, 0.3, 0],
      explodeDistance: 0.1,
      color: '#CCAA33',
    },
    {
      id: 'link',
      glbFile: 'link.glb',
      name: 'Finger Link',
      nameKo: '핑거 링크',
      description: '기어와 핑거를 연결하는 링크입니다. 평행 이동을 가능하게 합니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, -0.02, 0],
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.08,
      color: '#3399CC',
    },
    {
      id: 'gripper',
      glbFile: 'gripper.glb',
      name: 'Gripper Fingers',
      nameKo: '그리퍼 핑거',
      description: '물체와 직접 접촉하는 집게 부분입니다. 다양한 형상의 물체를 파지할 수 있습니다.',
      material: '알루미늄 합금',
      assemblyPosition: [0, -0.05, 0],
      explodeDirection: [0, -1, 0],
      explodeDistance: 0.15,
      color: '#CC3333',
    },
    {
      id: 'pin',
      glbFile: 'pin.glb',
      name: 'Pivot Pin',
      nameKo: '피벗 핀',
      description: '링크의 회전축 역할을 하는 핀입니다. 정밀한 움직임을 보장합니다.',
      material: '스테인리스강',
      assemblyPosition: [0, -0.01, 0],
      explodeDirection: [0.5, -0.5, 0.5],
      explodeDistance: 0.06,
      color: '#C0C0C0',
    },
  ],
};
