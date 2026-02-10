import { ModelQuiz } from './types';

export const suspensionQuiz: ModelQuiz = {
  modelId: 'suspension',
  titleKo: '자동차 서스펜션 이해도 퀴즈',
  description: '자동차 서스펜션의 구조와 충격 흡수 원리를 확인해보세요.',
  questions: [
    // 1. 객관식 - 역할
    {
      id: 'ss-q1',
      type: 'multiple-choice',
      question: '서스펜션의 주요 역할은 무엇인가요?',
      options: ['엔진 출력 증가', '충격 흡수 및 승차감 향상', '연료 효율 개선', '차량 속도 제어'],
      correctAnswer: 1,
      explanation:
        '서스펜션은 차체와 바퀴 사이에서 도로의 충격을 흡수하고 승차감을 향상시키는 핵심 부품입니다.',
      difficulty: 'easy',
    },
    // 2. O/X - 후크의 법칙
    {
      id: 'ss-q2',
      type: 'true-false',
      question: '코일 스프링에 가해지는 힘은 변위에 비례한다. (F = -kx)',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '후크의 법칙(F = -kx)에 따라 스프링 힘은 변위에 비례하며, k는 스프링 상수입니다.',
      difficulty: 'easy',
    },
    // 3. 부품 클릭 - 코일 스프링
    {
      id: 'ss-q3',
      type: 'identify-part',
      question: '충격을 흡수하여 탄성 에너지로 저장하는 핵심 부품을 클릭하세요.',
      partId: 'spring',
      correctAnswer: 'spring',
      explanation:
        '코일 스프링은 압축과 신장을 반복하며 탄성 에너지를 저장하여 충격을 흡수합니다.',
      difficulty: 'easy',
    },
    // 4. 객관식 - 댐퍼 원리
    {
      id: 'ss-q4',
      type: 'multiple-choice',
      question: '댐퍼(쇼크 앱소버)는 어떤 방식으로 진동을 감쇠시키나요?',
      options: [
        '자기장을 이용',
        '오일이 작은 구멍을 통과하며 열로 변환',
        '공기 압축',
        '고무 탄성 이용',
      ],
      correctAnswer: 1,
      explanation:
        '댐퍼 내부의 오일이 피스톤의 작은 구멍(오리피스)을 통과하며 운동 에너지를 열에너지로 변환합니다.',
      difficulty: 'medium',
    },
    // 5. 부품 클릭 - 상단 마운트
    {
      id: 'ss-q5',
      type: 'identify-part',
      question: '서스펜션을 차체에 연결하는 상단 고정 부품을 클릭하세요.',
      partId: 'base',
      correctAnswer: 'base',
      explanation:
        '상단 마운트는 서스펜션을 차체에 연결하며, 진동이 차체로 전달되는 것을 최소화합니다.',
      difficulty: 'easy',
    },
    // 6. O/X - 감쇠력
    {
      id: 'ss-q6',
      type: 'true-false',
      question: '댐퍼의 감쇠력은 피스톤의 속도에 비례한다. (F = -cv)',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '감쇠력 공식 F = -cv에서 c는 감쇠 계수, v는 속도입니다. 속도가 빠를수록 감쇠력이 커집니다.',
      difficulty: 'medium',
    },
    // 7. 부품 클릭 - 피스톤 로드
    {
      id: 'ss-q7',
      type: 'identify-part',
      question: '댐퍼 내부의 피스톤과 연결되어 진동을 감쇠시키는 로드를 클릭하세요.',
      partId: 'rod',
      correctAnswer: 'rod',
      explanation:
        '피스톤 로드는 댐퍼 내부의 피스톤과 연결되어 오일을 통해 진동을 감쇠시킵니다.',
      difficulty: 'easy',
    },
    // 8. 객관식 - 고유 진동수
    {
      id: 'ss-q8',
      type: 'multiple-choice',
      question: '서스펜션의 고유 진동수(ω)를 구하는 공식은?',
      options: ['ω = k/m', 'ω = √(k/m)', 'ω = m/k', 'ω = k×m'],
      correctAnswer: 1,
      explanation:
        '고유 진동수 ω = √(k/m)에서 k는 스프링 상수, m은 질량입니다. 이 값이 도로의 진동 주파수와 일치하면 공진이 발생합니다.',
      difficulty: 'hard',
    },
    // 9. 부품 클릭 - 하단 마운트
    {
      id: 'ss-q9',
      type: 'identify-part',
      question: '서스펜션을 바퀴(휠 허브)에 연결하는 하단 고정 부품을 클릭하세요.',
      partId: 'nit',
      correctAnswer: 'nit',
      explanation:
        '하단 마운트는 서스펜션을 바퀴(휠 허브)에 연결하는 고정 부품입니다.',
      difficulty: 'easy',
    },
    // 10. O/X - 스프링 강
    {
      id: 'ss-q10',
      type: 'true-false',
      question: '코일 스프링은 일반적으로 스프링 강(spring steel)으로 제작된다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '코일 스프링은 높은 피로 강도와 탄성을 위해 스프링 강으로 제작됩니다.',
      difficulty: 'easy',
    },
    // 추가 문제 11-30
    {
      id: 'ss-q11',
      type: 'multiple-choice',
      question: '스프링 상수(k)가 큰 스프링의 특성은?',
      options: ['부드러운 승차감', '딱딱한 승차감', '느린 반응', '낮은 내구성'],
      correctAnswer: 1,
      explanation:
        '스프링 상수가 클수록 같은 변위에서 더 큰 힘이 필요하므로 딱딱한 승차감을 제공합니다.',
      difficulty: 'easy',
    },
    {
      id: 'ss-q12',
      type: 'true-false',
      question: '서스펜션이 없으면 타이어가 도로에서 떨어지는 현상이 발생할 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '서스펜션이 없으면 노면의 요철에 의해 타이어가 도로에서 이탈하여 접지력이 떨어집니다.',
      difficulty: 'easy',
    },
    {
      id: 'ss-q13',
      type: 'identify-part',
      question: '크롬 도금된 강철로 제작된 감쇠 부품을 클릭하세요.',
      partId: 'rod',
      correctAnswer: 'rod',
      explanation:
        '피스톤 로드는 내마모성과 내식성을 위해 크롬 도금 강철로 제작됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q14',
      type: 'multiple-choice',
      question: '다음 중 독립 현가식 서스펜션의 장점은?',
      options: [
        '구조가 단순하다',
        '제조 비용이 낮다',
        '한쪽 바퀴의 충격이 반대쪽에 전달되지 않는다',
        '내구성이 높다',
      ],
      correctAnswer: 2,
      explanation:
        '독립 현가식은 각 바퀴가 독립적으로 움직여 한쪽의 충격이 반대쪽에 영향을 주지 않습니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q15',
      type: 'true-false',
      question: '댐퍼가 없으면 스프링이 충격 흡수 후 계속 진동한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '댐퍼가 없으면 스프링의 탄성으로 인해 진동이 지속되어 승차감이 크게 악화됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'ss-q16',
      type: 'identify-part',
      question: '알루미늄 합금으로 제작된 상단 고정 부품을 클릭하세요.',
      partId: 'base',
      correctAnswer: 'base',
      explanation:
        '상단 마운트는 가볍고 강한 알루미늄 합금으로 제작되어 차체에 진동 전달을 최소화합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q17',
      type: 'multiple-choice',
      question: '서스펜션에서 "바운스(Bounce)"란 무엇인가요?',
      options: [
        '차체의 좌우 흔들림',
        '차체의 상하 운동',
        '차체의 전후 기울임',
        '바퀴의 회전',
      ],
      correctAnswer: 1,
      explanation:
        '바운스는 차체가 수직 방향으로 상하 운동하는 것으로, 서스펜션의 주요 제어 대상입니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q18',
      type: 'true-false',
      question: '과감쇠(Overdamped) 상태에서는 진동 없이 느리게 원래 위치로 돌아간다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '과감쇠에서는 진동 없이 천천히 평형 위치로 복귀합니다. 승차감은 좋으나 반응이 느립니다.',
      difficulty: 'hard',
    },
    {
      id: 'ss-q19',
      type: 'identify-part',
      question: '주철로 제작된 하단 연결 부품을 클릭하세요.',
      partId: 'nit',
      correctAnswer: 'nit',
      explanation:
        '하단 마운트는 높은 하중을 견디기 위해 주철로 제작됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q20',
      type: 'multiple-choice',
      question: '서스펜션의 "스트로크(Stroke)"란 무엇인가요?',
      options: [
        '스프링의 자유 길이',
        '서스펜션이 움직일 수 있는 범위',
        '댐퍼의 직경',
        '마운트의 높이',
      ],
      correctAnswer: 1,
      explanation:
        '스트로크는 서스펜션이 압축 및 신장할 수 있는 전체 이동 범위입니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q21',
      type: 'true-false',
      question: '코일 스프링의 감김 수(권수)가 많을수록 스프링 상수가 작아진다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '감김 수가 많을수록 스프링이 더 유연해져 스프링 상수가 작아집니다.',
      difficulty: 'hard',
    },
    {
      id: 'ss-q22',
      type: 'identify-part',
      question: '파란색으로 표시된 탄성 에너지 저장 부품을 클릭하세요.',
      partId: 'spring',
      correctAnswer: 'spring',
      explanation:
        '코일 스프링은 압축과 신장을 통해 충격 에너지를 탄성 에너지로 저장합니다.',
      difficulty: 'easy',
    },
    {
      id: 'ss-q23',
      type: 'multiple-choice',
      question: '다음 중 서스펜션 종류가 아닌 것은?',
      options: ['맥퍼슨 스트럿', '더블 위시본', '토션 빔', '플라이휠'],
      correctAnswer: 3,
      explanation:
        '플라이휠은 에너지 저장 장치로, 서스펜션의 종류가 아닙니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q24',
      type: 'true-false',
      question: '에어 서스펜션은 공기 압력으로 스프링 역할을 한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '에어 서스펜션은 공기 주머니의 압력을 조절하여 스프링 역할을 하며, 차고 조절이 가능합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q25',
      type: 'multiple-choice',
      question: '임계 감쇠(Critical Damping)의 의미는?',
      options: [
        '진동 없이 가장 빠르게 평형으로 복귀',
        '감쇠가 전혀 없는 상태',
        '최대 진동을 유발하는 상태',
        '스프링이 파손되는 상태',
      ],
      correctAnswer: 0,
      explanation:
        '임계 감쇠는 진동 없이 가능한 가장 빠르게 평형 위치로 복귀하는 최적의 감쇠 상태입니다.',
      difficulty: 'hard',
    },
    {
      id: 'ss-q26',
      type: 'true-false',
      question: '서스펜션의 감쇠비(ζ)가 1보다 크면 과감쇠 상태이다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '감쇠비 ζ > 1이면 과감쇠, ζ = 1이면 임계감쇠, ζ < 1이면 부족감쇠(진동 발생)입니다.',
      difficulty: 'hard',
    },
    {
      id: 'ss-q27',
      type: 'identify-part',
      question: '서스펜션의 핵심 감쇠 장치를 클릭하세요.',
      partId: 'rod',
      correctAnswer: 'rod',
      explanation:
        '피스톤 로드는 댐퍼의 핵심 부품으로, 오일을 통해 진동 에너지를 열로 변환합니다.',
      difficulty: 'easy',
    },
    {
      id: 'ss-q28',
      type: 'multiple-choice',
      question: '서스펜션에서 "롤(Roll)"이란 무엇인가요?',
      options: [
        '차체의 상하 운동',
        '차체의 좌우 기울임',
        '차체의 전후 기울임',
        '바퀴의 회전 운동',
      ],
      correctAnswer: 1,
      explanation:
        '롤은 코너링 시 차체가 좌우로 기울어지는 운동으로, 안티롤 바로 제어합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q29',
      type: 'true-false',
      question: '코일 스프링의 와이어 직경이 굵을수록 스프링 상수가 커진다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '와이어 직경이 굵을수록 강성이 증가하여 스프링 상수가 커집니다.',
      difficulty: 'medium',
    },
    {
      id: 'ss-q30',
      type: 'identify-part',
      question: '스프링 강으로 제작된 서스펜션의 탄성 부품을 클릭하세요.',
      partId: 'spring',
      correctAnswer: 'spring',
      explanation:
        '코일 스프링은 높은 피로 강도와 탄성을 가진 스프링 강으로 제작됩니다.',
      difficulty: 'easy',
    },
  ],
};
