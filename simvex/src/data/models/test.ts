import { CombinedModelConfig } from '@/components/viewer/CombinedGLBPart';

export const testModel: CombinedModelConfig = {
  id: 'test',
  name: 'Test Combined Model',
  nameKo: '테스트 통합 모델',
  description: 'Maya에서 조립 후 하나의 GLB로 export한 테스트 모델입니다.',
  theory: `통합 GLB 테스트:

이 모델은 여러 부품이 하나의 GLB 파일에 포함되어 있습니다.
각 부품은 메시 이름으로 구분되어 분해/조립이 가능합니다.`,
  category: '테스트',
  thumbnail: '/models/test/thumbnail.png',
  glbPath: '/models/test/Test_001_glb.glb',
  cameraPosition: [5, 3, 5],
  cameraTarget: [0, 0, 0],
  parts: [
    {
      id: 'impeller-blade',
      meshName: 'Impellar_BladeSolid1',  // 콜론 제거됨
      name: 'Impeller Blade',
      nameKo: '임펠러 블레이드',
      description: '프로펠러/팬 블레이드입니다.',
      material: '플라스틱',
      explodeDirection: [0, 1, 0],
      explodeDistance: 2,
      color: '#4488FF',
    },
    {
      id: 'main-frame',
      meshName: 'Main_frameSolid1',  // 콜론 제거됨
      name: 'Main Frame',
      nameKo: '메인 프레임',
      description: '본체의 메인 프레임입니다.',
      material: '알루미늄',
      explodeDirection: [1, 0, 0],
      explodeDistance: 2,
      color: '#FF4444',
    },
    {
      id: 'main-frame-mir',
      meshName: 'Main_frame_MIRSolid1',  // 콜론 제거됨
      name: 'Main Frame (Mirror)',
      nameKo: '메인 프레임 (미러)',
      description: '본체의 메인 프레임 미러 파트입니다.',
      material: '알루미늄',
      explodeDirection: [-1, 0, 0],
      explodeDistance: 2,
      color: '#44FF44',
    },
  ],
};
