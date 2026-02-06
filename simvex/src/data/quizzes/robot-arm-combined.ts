import { ModelQuiz } from './types';

export const robotArmCombinedQuiz: ModelQuiz = {
  modelId: 'robot-arm-combined',
  titleKo: '산업용 로봇 암 이해도 퀴즈',
  description: '6축 다관절 로봇 암의 구조와 원리를 얼마나 이해했는지 확인해보세요.',
  questions: [
    // 1. 객관식 - 자유도
    {
      id: 'ra-q1',
      type: 'multiple-choice',
      question: '6축 로봇 암이 가지는 자유도(DOF)는 몇 개인가요?',
      options: ['3개', '4개', '6개', '8개'],
      correctAnswer: 2,
      explanation:
        '6축 로봇은 6개의 자유도를 가지며, 이를 통해 3D 공간에서 임의의 위치와 방향으로 이동할 수 있습니다.',
      difficulty: 'easy',
    },
    // 2. O/X - 역운동학
    {
      id: 'ra-q2',
      type: 'true-false',
      question: '역운동학(IK)은 관절각으로부터 말단 장치의 위치를 계산하는 방법이다.',
      options: ['O', 'X'],
      correctAnswer: 1,
      explanation:
        '역운동학(IK)은 목표 위치로부터 관절각을 계산합니다. 관절각에서 말단 위치를 계산하는 것은 순운동학(FK)입니다.',
      difficulty: 'medium',
    },
    // 3. 부품 클릭 - 베이스
    {
      id: 'ra-q3',
      type: 'identify-part',
      question: '로봇 암을 지면에 고정하는 기초 부품을 클릭하세요.',
      partId: 'base',
      correctAnswer: 'base',
      explanation:
        '베이스는 로봇 암의 기초 부품으로, 첫 번째 회전축(Axis 1)이 위치합니다.',
      difficulty: 'easy',
    },
    // 4. 객관식 - 야코비안
    {
      id: 'ra-q4',
      type: 'multiple-choice',
      question: '로봇 공학에서 야코비안(Jacobian)의 역할은 무엇인가요?',
      options: [
        '모터 전력 계산',
        '말단 속도와 관절 속도의 관계 정의',
        '로봇 무게 측정',
        '카메라 보정',
      ],
      correctAnswer: 1,
      explanation:
        '야코비안은 말단 장치의 속도와 각 관절의 속도 사이의 관계를 정의하는 행렬입니다.',
      difficulty: 'hard',
    },
    // 5. 부품 클릭 - 숄더
    {
      id: 'ra-q5',
      type: 'identify-part',
      question: '로봇 암의 전후 기울기를 제어하는 두 번째 관절(Axis 2)을 클릭하세요.',
      partId: 'shoulder',
      correctAnswer: 'shoulder',
      explanation:
        '숄더(어깨)는 두 번째 관절로, 로봇 암의 전후 기울기를 제어합니다.',
      difficulty: 'medium',
    },
    // 6. O/X - 작업 영역
    {
      id: 'ra-q6',
      type: 'true-false',
      question: '작업 영역(Workspace)은 로봇 암이 도달할 수 있는 모든 점들의 집합이다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '작업 영역은 로봇 말단 장치가 도달할 수 있는 모든 점들의 집합으로, 로봇 설계의 중요한 사양입니다.',
      difficulty: 'easy',
    },
    // 7. 부품 클릭 - 엘보
    {
      id: 'ra-q7',
      type: 'identify-part',
      question: '상완과 하완을 연결하는 세 번째 관절(팔꿈치)을 클릭하세요.',
      partId: 'elbow',
      correctAnswer: 'elbow',
      explanation:
        '엘보(팔꿈치)는 세 번째 관절로, 상완과 하완을 연결하며 Axis 3가 위치합니다.',
      difficulty: 'easy',
    },
    // 8. 객관식 - DH 파라미터
    {
      id: 'ra-q8',
      type: 'multiple-choice',
      question: 'DH(Denavit-Hartenberg) 파라미터는 무엇을 정의하는 데 사용되나요?',
      options: [
        '로봇의 색상',
        '링크 간 변환 행렬',
        '모터 규격',
        '전원 요구 사항',
      ],
      correctAnswer: 1,
      explanation:
        'DH 파라미터는 로봇의 각 링크 간 변환 행렬을 체계적으로 정의하는 표준 방법입니다.',
      difficulty: 'hard',
    },
    // 9. 부품 클릭 - 말단 장치
    {
      id: 'ra-q9',
      type: 'identify-part',
      question: '그리퍼, 용접 토치 등을 장착하는 말단 장치 플랜지를 클릭하세요.',
      partId: 'end-effector-a',
      correctAnswer: 'end-effector-a',
      explanation:
        '말단 장치(End Effector)는 로봇 암 끝에 위치하며, 다양한 도구를 장착할 수 있는 플랜지입니다.',
      difficulty: 'medium',
    },
    // 10. O/X - 토크 공식
    {
      id: 'ra-q10',
      type: 'true-false',
      question: '로봇 관절의 토크는 야코비안의 전치행렬과 말단 힘의 곱으로 계산된다. (τ = J^T × F)',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '토크 공식 τ = J^T × F에서 J는 야코비안, F는 말단에 작용하는 힘입니다. 이 관계를 통해 필요한 관절 토크를 계산합니다.',
      difficulty: 'hard',
    },
    // 추가 문제 11-30
    {
      id: 'ra-q11',
      type: 'identify-part',
      question: '주요 리치(reach)를 담당하는 상완부를 클릭하세요.',
      partId: 'upper-arm',
      correctAnswer: 'upper-arm',
      explanation:
        '상완부는 로봇 암의 도달 거리를 결정하는 주요 링크로, 큰 토크를 견딜 수 있도록 설계됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'ra-q12',
      type: 'multiple-choice',
      question: '로봇 암에서 "특이점(Singularity)"이란 무엇인가요?',
      options: [
        '최대 속도 지점',
        '자유도가 상실되는 자세',
        '최대 힘을 낼 수 있는 위치',
        '에너지 효율이 최고인 지점',
      ],
      correctAnswer: 1,
      explanation:
        '특이점은 야코비안의 행렬식이 0이 되어 일부 방향으로 움직일 수 없게 되는 자세입니다.',
      difficulty: 'hard',
    },
    {
      id: 'ra-q13',
      type: 'true-false',
      question: '산업용 로봇 암의 재질로 알루미늄 합금이 많이 사용된다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '알루미늄 합금은 가볍고 강도가 높아 로봇 암의 링크 재질로 널리 사용됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'ra-q14',
      type: 'identify-part',
      question: '손목 관절을 지지하는 하완부를 클릭하세요.',
      partId: 'forearm',
      correctAnswer: 'forearm',
      explanation:
        '하완부는 손목 관절을 지지하며, 내부에 Axis 4 모터가 있습니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q15',
      type: 'multiple-choice',
      question: '로봇 팔의 "페이로드(Payload)"란 무엇인가요?',
      options: [
        '로봇의 총 무게',
        '최대 도달 거리',
        '들어올릴 수 있는 최대 하중',
        '관절의 개수',
      ],
      correctAnswer: 2,
      explanation:
        '페이로드는 로봇 암이 말단 장치를 포함하여 들어올릴 수 있는 최대 하중입니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q16',
      type: 'true-false',
      question: '로봇 암의 반복 정밀도는 절대 정밀도보다 일반적으로 더 좋다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '반복 정밀도는 같은 위치로 반복 이동하는 정확도로, 절대 정밀도보다 보통 10배 이상 좋습니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q17',
      type: 'identify-part',
      question: '손목의 상하 기울기를 제어하는 부품(Axis 5)을 클릭하세요.',
      partId: 'wrist-pitch',
      correctAnswer: 'wrist-pitch',
      explanation:
        '손목 피치는 손목의 상하 기울기를 제어하며, Axis 5에 해당합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q18',
      type: 'multiple-choice',
      question: '산업용 로봇의 주요 응용 분야가 아닌 것은?',
      options: ['용접', '도장', '조립', '요리'],
      correctAnswer: 3,
      explanation:
        '산업용 로봇은 주로 용접, 도장, 조립, 팔레타이징 등 제조업에서 사용됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'ra-q19',
      type: 'true-false',
      question: '로봇 암의 관절은 모두 회전 관절(Revolute Joint)이다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '대부분의 산업용 6축 로봇은 모든 관절이 회전 관절로 구성되어 있습니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q20',
      type: 'identify-part',
      question: '손목의 회전을 제어하는 부품(Axis 6)을 클릭하세요.',
      partId: 'wrist-roll-a',
      correctAnswer: 'wrist-roll-a',
      explanation:
        '손목 롤은 말단 장치의 회전 방향을 정밀하게 조절하는 Axis 6입니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q21',
      type: 'multiple-choice',
      question: '로봇 암 제어에서 PID 제어의 P는 무엇을 의미하나요?',
      options: ['Power', 'Proportional', 'Position', 'Pressure'],
      correctAnswer: 1,
      explanation:
        'PID에서 P는 Proportional(비례)로, 현재 오차에 비례하여 제어 신호를 생성합니다.',
      difficulty: 'hard',
    },
    {
      id: 'ra-q22',
      type: 'true-false',
      question: 'TCP(Tool Center Point)는 말단 장치의 기준점이다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        'TCP는 말단 도구의 작업 기준점으로, 로봇 프로그래밍의 기준이 됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q23',
      type: 'multiple-choice',
      question: '로봇 암의 "리치(Reach)"란 무엇인가요?',
      options: [
        '최대 속도',
        '최대 도달 거리',
        '최대 토크',
        '최대 가속도',
      ],
      correctAnswer: 1,
      explanation:
        '리치는 로봇 암이 도달할 수 있는 최대 거리로, 링크 길이의 합으로 결정됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'ra-q24',
      type: 'identify-part',
      question: '말단 장치의 보조 마운트를 클릭하세요.',
      partId: 'end-effector-b',
      correctAnswer: 'end-effector-b',
      explanation:
        '말단 장치 B는 말단 장치의 보조 마운트 역할을 합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q25',
      type: 'true-false',
      question: '협동 로봇(Cobot)은 사람과 안전하게 함께 작업할 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '협동 로봇은 충돌 감지, 힘 제한 등 안전 기능을 갖춰 사람과 같은 공간에서 작업할 수 있습니다.',
      difficulty: 'easy',
    },
    {
      id: 'ra-q26',
      type: 'multiple-choice',
      question: '로봇 암의 축(Axis)은 보통 어떤 순서로 번호가 매겨지나요?',
      options: [
        '말단에서 베이스 순',
        '베이스에서 말단 순',
        '크기순',
        '설치 순서',
      ],
      correctAnswer: 1,
      explanation:
        '로봇 축은 베이스(Axis 1)에서 시작하여 말단(Axis 6)으로 번호가 매겨집니다.',
      difficulty: 'easy',
    },
    {
      id: 'ra-q27',
      type: 'true-false',
      question: '로봇 암의 동작 범위는 각 관절의 회전 한계에 의해 결정된다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '각 관절의 기계적 회전 한계가 전체 동작 범위와 작업 영역을 결정합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q28',
      type: 'identify-part',
      question: '손목 롤의 보조 구조물을 클릭하세요.',
      partId: 'wrist-roll-b',
      correctAnswer: 'wrist-roll-b',
      explanation:
        '손목 롤 B는 손목 롤의 보조 구조물입니다.',
      difficulty: 'hard',
    },
    {
      id: 'ra-q29',
      type: 'multiple-choice',
      question: '로봇 프로그래밍에서 "티칭(Teaching)"이란?',
      options: [
        '로봇 교육 과정',
        '수동으로 위치를 기록하는 방식',
        '자동 경로 생성',
        '센서 보정',
      ],
      correctAnswer: 1,
      explanation:
        '티칭은 작업자가 로봇을 직접 움직여 원하는 위치를 기록하는 프로그래밍 방식입니다.',
      difficulty: 'medium',
    },
    {
      id: 'ra-q30',
      type: 'true-false',
      question: '베이스의 첫 번째 축(Axis 1)은 수직축 회전을 담당한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        'Axis 1은 베이스에서 수직축을 중심으로 회전하여 로봇의 좌우 방향을 결정합니다.',
      difficulty: 'easy',
    },
  ],
};
