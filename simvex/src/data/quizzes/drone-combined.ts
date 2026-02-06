import { ModelQuiz } from './types';

export const droneCombinedQuiz: ModelQuiz = {
  modelId: 'drone-combined',
  titleKo: '드론 구조 퀴즈',
  description: '쿼드콥터 드론의 구조와 비행 원리에 대한 이해도를 확인합니다.',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: '쿼드콥터 드론에는 몇 개의 프로펠러가 있나요?',
      options: ['2개', '4개', '6개', '8개'],
      correctAnswer: 1, // 4개 (0-indexed)
      explanation:
        '쿼드콥터(Quadcopter)는 "Quad(4)" + "Copter(헬리콥터)"의 합성어로, 4개의 프로펠러를 사용합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q2',
      type: 'true-false',
      question: '드론의 인접한 두 모터는 같은 방향으로 회전한다.',
      options: ['O', 'X'],
      correctAnswer: 1, // X (False)
      explanation:
        '인접한 모터는 반대 방향으로 회전하여 토크를 상쇄합니다. 대각선 모터끼리는 같은 방향으로 회전합니다.',
      difficulty: 'medium',
    },
    {
      id: 'q3',
      type: 'identify-part',
      question: '드론의 추력을 발생시키는 프로펠러(블레이드)를 클릭하세요.',
      partId: 'blade-1',
      correctAnswer: 'blade-1',
      explanation:
        '블레이드(프로펠러)는 모터에 의해 회전하며 양력을 발생시켜 드론이 비행할 수 있게 합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: '메인 프레임의 주요 재질은 무엇인가요?',
      options: ['알루미늄', '스테인리스 스틸', '카본 파이버', '강화 플라스틱'],
      correctAnswer: 2, // 카본 파이버
      explanation:
        '카본 파이버(탄소 섬유)는 가볍고 강도가 높아 드론 프레임에 많이 사용됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'q5',
      type: 'identify-part',
      question: '모터와 프로펠러를 연결하는 암 기어를 클릭하세요.',
      partId: 'arm-gear-1',
      correctAnswer: 'arm-gear-1',
      explanation:
        '암 기어는 모터의 회전력을 프로펠러에 전달하는 역할을 합니다.',
      difficulty: 'medium',
    },
    {
      id: 'q6',
      type: 'true-false',
      question: '드론이 상승하려면 4개의 모터 회전 속도를 모두 높여야 한다.',
      options: ['O', 'X'],
      correctAnswer: 0, // O (True)
      explanation:
        '4개 모터의 회전 속도를 동시에 높이면 총 양력이 증가하여 드론이 상승합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q7',
      type: 'multiple-choice',
      question: '드론의 기어링 시스템의 주된 역할은 무엇인가요?',
      options: [
        '배터리 보호',
        '동력 전달',
        '진동 감쇠',
        '카메라 안정화',
      ],
      correctAnswer: 1, // 동력 전달
      explanation:
        '기어링은 모터에서 발생한 동력을 프로펠러에 효율적으로 전달하는 역할을 합니다.',
      difficulty: 'medium',
    },
    {
      id: 'q8',
      type: 'identify-part',
      question: '드론의 중심 본체인 메인 프레임을 클릭하세요.',
      partId: 'main-frame',
      correctAnswer: 'main-frame',
      explanation:
        '메인 프레임은 드론의 중심 본체로, 모터, 배터리, 제어보드 등 모든 부품이 장착됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'q9',
      type: 'true-false',
      question: '드론이 앞으로 기울어지면 전진한다.',
      options: ['O', 'X'],
      correctAnswer: 0, // O (True)
      explanation:
        '뒤쪽 모터의 속도를 높이면 드론이 앞으로 기울어지고, 양력의 일부가 전진 추력으로 작용하여 드론이 전진합니다.',
      difficulty: 'hard',
    },
    {
      id: 'q10',
      type: 'multiple-choice',
      question: '나사와 너트의 재질은 무엇인가요?',
      options: ['알루미늄', '강화 플라스틱', '카본 파이버', '스테인리스 스틸'],
      correctAnswer: 3, // 스테인리스 스틸
      explanation:
        '나사와 너트는 부식 방지와 강도를 위해 스테인리스 스틸로 제작됩니다.',
      difficulty: 'easy',
    },
    // 추가 문제 11-30
    {
      id: 'q11',
      type: 'identify-part',
      question: '프로펠러를 회전시키는 모터를 클릭하세요.',
      partId: 'motor-1',
      correctAnswer: 'motor-1',
      explanation:
        'BLDC(브러시리스 DC) 모터는 전기 에너지를 회전 에너지로 변환하여 프로펠러를 돌립니다.',
      difficulty: 'easy',
    },
    {
      id: 'q12',
      type: 'multiple-choice',
      question: '드론이 시계 방향으로 회전(Yaw)하려면 어떻게 해야 하나요?',
      options: [
        '모든 모터 속도 증가',
        '반시계 방향 모터 속도 증가',
        '시계 방향 모터 속도 증가',
        '앞쪽 모터 속도 증가',
      ],
      correctAnswer: 1, // 반시계 방향 모터 속도 증가
      explanation:
        '반시계 방향으로 회전하는 모터의 속도를 높이면 반작용으로 기체가 시계 방향으로 회전합니다.',
      difficulty: 'hard',
    },
    {
      id: 'q13',
      type: 'true-false',
      question: '드론의 랜딩 기어는 착륙 시 충격을 흡수한다.',
      options: ['O', 'X'],
      correctAnswer: 0, // O (True)
      explanation:
        '랜딩 기어(랜딩 레그)는 착륙 시 충격을 흡수하고 기체를 지면에서 띄워 프로펠러와 카메라를 보호합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q14',
      type: 'identify-part',
      question: '드론의 착륙 다리(랜딩 레그)를 클릭하세요.',
      partId: 'landing-leg-1',
      correctAnswer: 'landing-leg-1',
      explanation:
        '랜딩 레그는 착륙 시 기체를 지지하고 충격을 흡수하는 역할을 합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q15',
      type: 'multiple-choice',
      question: '드론 모터에 주로 사용되는 모터 종류는?',
      options: ['DC 브러시 모터', 'BLDC 모터', '스테핑 모터', '서보 모터'],
      correctAnswer: 1, // BLDC 모터
      explanation:
        'BLDC(Brushless DC) 모터는 높은 효율, 긴 수명, 정밀한 제어가 가능하여 드론에 주로 사용됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'q16',
      type: 'true-false',
      question: '드론의 프로펠러는 모두 같은 형태이다.',
      options: ['O', 'X'],
      correctAnswer: 1, // X (False)
      explanation:
        '시계 방향(CW)과 반시계 방향(CCW) 프로펠러는 날개의 피치가 반대입니다.',
      difficulty: 'medium',
    },
    {
      id: 'q17',
      type: 'identify-part',
      question: '모터를 고정하는 모터 마운트를 클릭하세요.',
      partId: 'motor-mount-1',
      correctAnswer: 'motor-mount-1',
      explanation:
        '모터 마운트는 모터를 프레임에 단단히 고정하여 진동을 최소화합니다.',
      difficulty: 'medium',
    },
    {
      id: 'q18',
      type: 'multiple-choice',
      question: '드론의 Pitch(피치) 움직임은 무엇인가요?',
      options: [
        '좌우 기울임',
        '전후 기울임',
        '수직 회전',
        '상하 이동',
      ],
      correctAnswer: 1, // 전후 기울임
      explanation:
        'Pitch는 드론의 전후 기울임으로, 전진 또는 후진 비행에 사용됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'q19',
      type: 'true-false',
      question: '드론의 ESC(전자변속기)는 모터의 회전 속도를 제어한다.',
      options: ['O', 'X'],
      correctAnswer: 0, // O (True)
      explanation:
        'ESC(Electronic Speed Controller)는 배터리 전력을 조절하여 각 모터의 회전 속도를 정밀하게 제어합니다.',
      difficulty: 'medium',
    },
    {
      id: 'q20',
      type: 'identify-part',
      question: '드론 상단의 덮개 플레이트를 클릭하세요.',
      partId: 'top-plate',
      correctAnswer: 'top-plate',
      explanation:
        '상단 플레이트는 내부 전자 부품을 보호하고 구조적 강성을 제공합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q21',
      type: 'multiple-choice',
      question: '드론의 Roll(롤) 움직임은 무엇인가요?',
      options: [
        '좌우 기울임',
        '전후 기울임',
        '수직 회전',
        '상하 이동',
      ],
      correctAnswer: 0, // 좌우 기울임
      explanation:
        'Roll은 드론의 좌우 기울임으로, 좌우 이동에 사용됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'q22',
      type: 'true-false',
      question: '드론 프레임에 카본 파이버를 사용하면 중량이 증가한다.',
      options: ['O', 'X'],
      correctAnswer: 1, // X (False)
      explanation:
        '카본 파이버는 강철보다 강하면서도 훨씬 가벼워 드론 경량화에 적합합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q23',
      type: 'identify-part',
      question: '드론 하단의 베이스 플레이트를 클릭하세요.',
      partId: 'bottom-plate',
      correctAnswer: 'bottom-plate',
      explanation:
        '하단 플레이트는 배터리와 전자부품을 장착하는 베이스 역할을 합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q24',
      type: 'multiple-choice',
      question: '호버링(Hovering)은 무엇인가요?',
      options: [
        '빠른 전진 비행',
        '공중 정지 비행',
        '급강하 비행',
        '회전 비행',
      ],
      correctAnswer: 1, // 공중 정지 비행
      explanation:
        '호버링은 드론이 한 지점에서 공중에 정지해 있는 상태로, 4개 모터가 균형있게 회전합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q25',
      type: 'true-false',
      question: '드론의 자이로스코프는 기체의 기울기를 감지한다.',
      options: ['O', 'X'],
      correctAnswer: 0, // O (True)
      explanation:
        '자이로스코프(Gyroscope)는 각속도를 측정하여 드론의 기울기 변화를 감지합니다.',
      difficulty: 'medium',
    },
    {
      id: 'q26',
      type: 'multiple-choice',
      question: '드론 비행 제어에 필요하지 않은 센서는?',
      options: ['자이로스코프', '가속도계', '기압계', '습도계'],
      correctAnswer: 3, // 습도계
      explanation:
        '자이로스코프, 가속도계, 기압계는 비행 안정화에 필수이지만, 습도계는 일반적으로 필요하지 않습니다.',
      difficulty: 'medium',
    },
    {
      id: 'q27',
      type: 'identify-part',
      question: '드론의 나사를 클릭하세요.',
      partId: 'screw-1',
      correctAnswer: 'screw-1',
      explanation:
        '나사는 각 부품을 단단히 고정하여 비행 중 진동에도 분리되지 않게 합니다.',
      difficulty: 'easy',
    },
    {
      id: 'q28',
      type: 'true-false',
      question: '드론의 프로펠러 피치가 높을수록 더 많은 양력을 발생시킨다.',
      options: ['O', 'X'],
      correctAnswer: 0, // O (True)
      explanation:
        '피치가 높으면 한 바퀴 회전당 더 많은 공기를 이동시켜 양력이 증가하지만, 모터 부하도 커집니다.',
      difficulty: 'hard',
    },
    {
      id: 'q29',
      type: 'multiple-choice',
      question: '드론이 왼쪽으로 이동하려면 어떤 모터의 속도를 높여야 하나요?',
      options: [
        '왼쪽 모터',
        '오른쪽 모터',
        '앞쪽 모터',
        '뒤쪽 모터',
      ],
      correctAnswer: 1, // 오른쪽 모터
      explanation:
        '오른쪽 모터의 속도를 높이면 드론이 왼쪽으로 기울어지며 왼쪽으로 이동합니다 (Roll).',
      difficulty: 'hard',
    },
    {
      id: 'q30',
      type: 'identify-part',
      question: '드론의 너트를 클릭하세요.',
      partId: 'nut-1',
      correctAnswer: 'nut-1',
      explanation:
        '너트는 나사와 함께 부품을 고정하며, 풀림 방지를 위해 락타이트를 사용하기도 합니다.',
      difficulty: 'easy',
    },
  ],
};
