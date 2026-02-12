import { ModelQuiz } from './types';

export const robotGripperCombinedQuiz: ModelQuiz = {
  modelId: 'robot-gripper-combined',
  titleKo: '로봇 그리퍼 이해도 퀴즈',
  description: '기어 연동 방식 로봇 그리퍼의 구조와 파지 원리를 확인해보세요.',
  questions: [
    // 1. 객관식 - 그리퍼 역할
    {
      id: 'rg-q1',
      type: 'multiple-choice',
      question: '로봇 그리퍼의 주요 역할은 무엇인가요?',
      options: ['로봇 이동', '물체 파지 및 이동', '센서 데이터 수집', '전원 공급'],
      correctAnswer: 1,
      explanation:
        '로봇 그리퍼는 산업용 로봇의 말단 장치로, 물체를 집고 이동시키는 역할을 합니다.',
      difficulty: 'easy',
    },
    // 2. O/X - 기어 연동
    {
      id: 'rg-q2',
      type: 'true-false',
      question: '기어 연동 그리퍼는 하나의 모터로 양쪽 집게를 동시에 구동할 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '기어 연동 메커니즘은 하나의 구동 기어로 양쪽 기어 링크를 동시에 구동하여 동기화된 파지를 제공합니다.',
      difficulty: 'easy',
    },
    // 3. 부품 클릭 - 그리퍼 핑거
    {
      id: 'rg-q3',
      type: 'identify-part',
      question: '물체와 직접 접촉하는 집게(핑거) 부분을 클릭하세요.',
      partId: 'gripper',
      correctAnswer: 'gripper',
      explanation:
        '그리퍼 핑거는 물체와 직접 접촉하여 파지하는 부분으로, 다양한 형상의 물체를 잡을 수 있습니다.',
      difficulty: 'easy',
    },
    // 4. 객관식 - 파지력 공식
    {
      id: 'rg-q4',
      type: 'multiple-choice',
      question: '파지력(F_grip) 계산에 필요하지 않은 요소는?',
      options: ['모터 토크(τ)', '기어비(G)', '핑거 반경(r)', '그리퍼 색상'],
      correctAnswer: 3,
      explanation:
        '파지력 F_grip = (τ × G) / r_finger에서 모터 토크, 기어비, 핑거 반경이 필요합니다.',
      difficulty: 'medium',
    },
    // 5. 부품 클릭 - 구동 기어
    {
      id: 'rg-q5',
      type: 'identify-part',
      question: '모터에서 동력을 받아 링크를 구동하는 메인 기어를 클릭하세요.',
      partId: 'base-gear',
      correctAnswer: 'base-gear',
      explanation:
        '구동 기어는 모터의 회전력을 받아 양쪽 기어 링크에 동력을 전달하는 핵심 부품입니다.',
      difficulty: 'easy',
    },
    // 6. O/X - 동기화
    {
      id: 'rg-q6',
      type: 'true-false',
      question: '기어 연동 그리퍼는 양쪽 핑거가 동기화되어 물체 중심을 자동으로 맞춘다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '기어 연동으로 양쪽 핑거가 동시에 같은 거리만큼 이동하므로 물체의 중심을 자동으로 맞춥니다.',
      difficulty: 'easy',
    },
    // 7. 부품 클릭 - 베이스 플레이트
    {
      id: 'rg-q7',
      type: 'identify-part',
      question: '그리퍼를 로봇 암에 장착하는 기초 구조물을 클릭하세요.',
      partId: 'base-plate',
      correctAnswer: 'base-plate',
      explanation:
        '베이스 플레이트는 그리퍼의 기초 구조물로, 로봇 암에 장착되는 부분입니다.',
      difficulty: 'easy',
    },
    // 8. 객관식 - 그리퍼 종류
    {
      id: 'rg-q8',
      type: 'multiple-choice',
      question: '다음 중 그리퍼의 종류가 아닌 것은?',
      options: ['2핑거 그리퍼', '3핑거 그리퍼', '진공 그리퍼', '스프링 모터'],
      correctAnswer: 3,
      explanation:
        '그리퍼의 종류에는 2핑거, 3핑거, 진공, 자석, 소프트 그리퍼 등이 있습니다.',
      difficulty: 'easy',
    },
    // 9. 부품 클릭 - 기어 링크
    {
      id: 'rg-q9',
      type: 'identify-part',
      question: '구동 기어와 맞물려 회전하는 연동 기어를 클릭하세요.',
      partId: 'gear-link-1',
      correctAnswer: 'gear-link-1',
      explanation:
        '기어 링크는 구동 기어와 맞물려 회전하며 핑거 링크에 동력을 전달합니다.',
      difficulty: 'medium',
    },
    // 10. O/X - 마찰력
    {
      id: 'rg-q10',
      type: 'true-false',
      question: '물체를 안정적으로 파지하려면 마찰력이 물체 무게보다 커야 한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '마찰력 F_friction = μ × F_normal이 물체 무게 이상이어야 미끄러지지 않고 안정적으로 파지됩니다.',
      difficulty: 'medium',
    },
    // 추가 문제 11-30
    {
      id: 'rg-q11',
      type: 'identify-part',
      question: '기어와 핑거를 연결하여 평행 이동을 가능하게 하는 링크를 클릭하세요.',
      partId: 'link-1',
      correctAnswer: 'link-1',
      explanation:
        '핑거 링크는 기어와 핑거를 연결하여 핑거의 평행 이동을 가능하게 합니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q12',
      type: 'multiple-choice',
      question: '기어비(Gear Ratio)가 높을수록 어떤 특성이 변하나요?',
      options: [
        '파지력 증가, 속도 감소',
        '파지력 감소, 속도 증가',
        '파지력과 속도 모두 증가',
        '파지력과 속도 모두 감소',
      ],
      correctAnswer: 0,
      explanation:
        '기어비가 높으면 토크가 증가하여 파지력은 커지지만, 핑거 이동 속도는 감소합니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q13',
      type: 'true-false',
      question: '평행 그리퍼는 핑거가 평행하게 이동하여 다양한 크기의 물체를 잡을 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '평행 그리퍼는 핑거가 평행하게 이동하므로 물체 크기에 관계없이 일정한 파지 각도를 유지합니다.',
      difficulty: 'easy',
    },
    {
      id: 'rg-q14',
      type: 'identify-part',
      question: '베이스 플레이트를 로봇 암 플랜지에 연결하는 브라켓을 클릭하세요.',
      partId: 'base-mounting-bracket',
      correctAnswer: 'base-mounting-bracket',
      explanation:
        '마운팅 브라켓은 베이스 플레이트를 로봇 암의 플랜지에 연결하는 부품입니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q15',
      type: 'multiple-choice',
      question: '소프트 그리퍼의 장점은 무엇인가요?',
      options: [
        '높은 파지력',
        '빠른 동작 속도',
        '연약한 물체를 손상 없이 파지',
        '높은 내구성',
      ],
      correctAnswer: 2,
      explanation:
        '소프트 그리퍼는 유연한 재질로 만들어져 과일, 전자부품 등 연약한 물체를 손상 없이 파지할 수 있습니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q16',
      type: 'true-false',
      question: '피벗 핀은 링크의 회전축 역할을 하여 정밀한 움직임을 보장한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '피벗 핀은 링크의 회전 중심축으로, 마찰을 최소화하여 정밀한 움직임을 보장합니다.',
      difficulty: 'easy',
    },
    {
      id: 'rg-q17',
      type: 'identify-part',
      question: '링크의 회전축 역할을 하는 피벗 핀을 클릭하세요.',
      partId: 'pin-1',
      correctAnswer: 'pin-1',
      explanation:
        '피벗 핀은 스테인리스강으로 제작되어 링크의 회전축 역할을 합니다.',
      difficulty: 'easy',
    },
    {
      id: 'rg-q18',
      type: 'multiple-choice',
      question: '그리퍼의 "개구량(Opening Width)"이란 무엇인가요?',
      options: [
        '핑거의 길이',
        '두 핑거 사이의 최대 거리',
        '그리퍼의 무게',
        '파지력의 크기',
      ],
      correctAnswer: 1,
      explanation:
        '개구량은 두 핑거 사이의 최대 거리로, 파지 가능한 물체의 최대 크기를 결정합니다.',
      difficulty: 'easy',
    },
    {
      id: 'rg-q19',
      type: 'true-false',
      question: '진공 그리퍼는 평면이 매끄러운 물체에 적합하다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '진공 그리퍼는 흡착 패드로 물체를 잡으므로 유리, 금속판 등 매끄러운 평면에 적합합니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q20',
      type: 'identify-part',
      question: '두 번째 그리퍼 핑거를 클릭하세요.',
      partId: 'gripper-2',
      correctAnswer: 'gripper-2',
      explanation:
        '두 번째 그리퍼 핑거는 첫 번째 핑거와 동기화되어 양쪽에서 물체를 파지합니다.',
      difficulty: 'easy',
    },
    {
      id: 'rg-q21',
      type: 'multiple-choice',
      question: '그리퍼 설계에서 "컴플라이언스(Compliance)"란?',
      options: [
        '최대 파지력',
        '위치 오차에 대한 유연한 적응력',
        '핑거 이동 속도',
        '그리퍼의 무게',
      ],
      correctAnswer: 1,
      explanation:
        '컴플라이언스는 위치 오차나 접촉 시 발생하는 힘에 유연하게 대응하는 능력입니다.',
      difficulty: 'hard',
    },
    {
      id: 'rg-q22',
      type: 'true-false',
      question: '자석 그리퍼는 비자성 물체도 파지할 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 1,
      explanation:
        '자석 그리퍼는 철, 니켈 등 자성체만 파지할 수 있으며, 비자성 물체에는 사용할 수 없습니다.',
      difficulty: 'easy',
    },
    {
      id: 'rg-q23',
      type: 'identify-part',
      question: '반대쪽 핑거를 구동하는 두 번째 연동 기어를 클릭하세요.',
      partId: 'gear-link-2',
      correctAnswer: 'gear-link-2',
      explanation:
        '기어 링크 2는 반대쪽 핑거를 구동하여 양쪽 핑거의 동기화를 실현합니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q24',
      type: 'multiple-choice',
      question: '그리퍼에서 "파지 안정성"을 높이려면 어떻게 해야 하나요?',
      options: [
        '핑거 길이를 줄인다',
        '접촉 면적을 넓힌다',
        '기어비를 낮춘다',
        '개구량을 줄인다',
      ],
      correctAnswer: 1,
      explanation:
        '접촉 면적을 넓히면 마찰력이 증가하고 하중이 분산되어 파지 안정성이 향상됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q25',
      type: 'true-false',
      question: '3핑거 그리퍼는 원통형 물체를 2핑거보다 안정적으로 잡을 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '3핑거 그리퍼는 120° 간격으로 물체를 잡아 원통형이나 구형 물체에서 더 안정적입니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q26',
      type: 'identify-part',
      question: '기어와 핑거를 연결하는 두 번째 링크를 클릭하세요.',
      partId: 'link-2',
      correctAnswer: 'link-2',
      explanation:
        '핑거 링크 2는 반대쪽 기어와 핑거를 연결하여 평행 이동을 가능하게 합니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q27',
      type: 'multiple-choice',
      question: '산업용 그리퍼에서 센서가 필요한 이유는?',
      options: [
        '전력 소비 측정',
        '파지 상태 감지 및 힘 제어',
        '온도 조절',
        '그리퍼 색상 변경',
      ],
      correctAnswer: 1,
      explanation:
        '센서(힘 센서, 근접 센서 등)를 통해 물체의 파지 상태를 감지하고 적절한 힘을 제어합니다.',
      difficulty: 'medium',
    },
    {
      id: 'rg-q28',
      type: 'true-false',
      question: '그리퍼의 핑거 소재는 파지 대상에 따라 달라져야 한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '부드러운 물체에는 고무, 단단한 물체에는 금속 핑거 등 대상에 따라 적합한 소재를 선택합니다.',
      difficulty: 'easy',
    },
    {
      id: 'rg-q29',
      type: 'identify-part',
      question: '강화 플라스틱으로 제작된 구동 기어를 클릭하세요.',
      partId: 'base-gear',
      correctAnswer: 'base-gear',
      explanation:
        '구동 기어는 가볍고 내마모성이 좋은 강화 플라스틱으로 제작됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'rg-q30',
      type: 'multiple-choice',
      question: '그리퍼의 "사이클 타임(Cycle Time)"이란?',
      options: [
        '그리퍼의 수명',
        '한 번 열고 닫는 데 걸리는 시간',
        '모터 교체 주기',
        '파지력 측정 주기',
      ],
      correctAnswer: 1,
      explanation:
        '사이클 타임은 그리퍼가 한 번 열고 닫는 전체 동작에 걸리는 시간으로, 생산성에 직접 영향을 줍니다.',
      difficulty: 'medium',
    },
  ],
};
