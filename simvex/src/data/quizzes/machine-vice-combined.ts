import { ModelQuiz } from './types';

export const machineViceCombinedQuiz: ModelQuiz = {
  modelId: 'machine-vice-combined',
  titleKo: '공작 기계 바이스 이해도 퀴즈',
  description: '공작 기계 바이스의 구조와 클램핑 원리를 확인해보세요.',
  questions: [
    // 1. 객관식 - 바이스 역할
    {
      id: 'mv-q1',
      type: 'multiple-choice',
      question: '공작 기계 바이스의 주요 역할은 무엇인가요?',
      options: ['절삭 가공', '가공물 고정', '측정', '냉각'],
      correctAnswer: 1,
      explanation:
        '공작 기계 바이스는 밀링, 드릴링 등 정밀 가공 시 가공물을 단단히 고정하는 장치입니다.',
      difficulty: 'easy',
    },
    // 2. O/X - 나사 메커니즘
    {
      id: 'mv-q2',
      type: 'true-false',
      question: '사다리꼴 나사(트래피지드 스크류)는 회전 운동을 직선 운동으로 변환한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '리드 스크류(사다리꼴 나사)를 회전시키면 이동 조가 직선으로 이동하여 가공물을 클램핑합니다.',
      difficulty: 'easy',
    },
    // 3. 부품 클릭 - 리드 스크류
    {
      id: 'mv-q3',
      type: 'identify-part',
      question: '회전 운동을 직선 운동으로 변환하는 리드 스크류를 클릭하세요.',
      partId: 'lead-screw',
      correctAnswer: 'lead-screw',
      explanation:
        '리드 스크류는 사다리꼴 나사로, 회전 운동을 직선 운동으로 변환하여 이동 조를 이동시킵니다.',
      difficulty: 'easy',
    },
    // 4. 객관식 - 기계적 이득
    {
      id: 'mv-q4',
      type: 'multiple-choice',
      question: '나사 메커니즘의 기계적 이득(MA) 공식은?',
      options: [
        'MA = p / 2πr',
        'MA = 2πr / p',
        'MA = r × p',
        'MA = r + p',
      ],
      correctAnswer: 1,
      explanation:
        '기계적 이득 MA = 2πr / p (r: 핸들 반경, p: 나사 피치)로, 적은 힘으로 큰 클램핑력을 얻을 수 있습니다.',
      difficulty: 'hard',
    },
    // 5. 부품 클릭 - 고정 조
    {
      id: 'mv-q5',
      type: 'identify-part',
      question: '움직이지 않는 고정된 조(Fixed Jaw)를 클릭하세요.',
      partId: 'fixed-jaw',
      correctAnswer: 'fixed-jaw',
      explanation:
        '고정 조는 베이스에 고정되어 움직이지 않으며, 가공물의 기준면 역할을 합니다.',
      difficulty: 'easy',
    },
    // 6. O/X - 셀프 로킹
    {
      id: 'mv-q6',
      type: 'true-false',
      question: '셀프 로킹은 나사 각도가 마찰각보다 작을 때 자동으로 잠기는 특성이다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '나사 각도(리드각)가 마찰각보다 작으면 외력이 가해져도 나사가 스스로 풀리지 않아 가공물이 안전하게 고정됩니다.',
      difficulty: 'hard',
    },
    // 7. 부품 클릭 - 이동 조
    {
      id: 'mv-q7',
      type: 'identify-part',
      question: '스핀들에 의해 이동하며 가공물을 클램핑하는 조를 클릭하세요.',
      partId: 'movable-jaw',
      correctAnswer: 'movable-jaw',
      explanation:
        '이동 조는 리드 스크류의 회전에 따라 전후로 이동하여 가공물을 클램핑합니다.',
      difficulty: 'easy',
    },
    // 8. 객관식 - 클램핑력 공식
    {
      id: 'mv-q8',
      type: 'multiple-choice',
      question: '클램핑력(F_clamp) 계산에 필요하지 않은 요소는?',
      options: ['토크(T)', '나사 피치(p)', '효율(η)', '바이스 색상'],
      correctAnswer: 3,
      explanation:
        '클램핑력 F_clamp = T × (2π / p) × η에서 토크, 나사 피치, 효율이 필요합니다.',
      difficulty: 'medium',
    },
    // 9. 부품 클릭 - 베이스 플레이트
    {
      id: 'mv-q9',
      type: 'identify-part',
      question: '바이스의 기초가 되는 베이스 플레이트를 클릭하세요.',
      partId: 'base-plate',
      correctAnswer: 'base-plate',
      explanation:
        '베이스 플레이트는 바이스의 기초로, T-슬롯을 통해 공작 기계 테이블에 고정됩니다.',
      difficulty: 'easy',
    },
    // 10. O/X - T-슬롯
    {
      id: 'mv-q10',
      type: 'true-false',
      question: 'T-슬롯은 바이스를 공작 기계 테이블에 고정하는 데 사용된다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        'T-슬롯은 T자 형태의 홈으로, T-볼트를 이용하여 바이스를 기계 테이블에 고정합니다.',
      difficulty: 'easy',
    },
    // 추가 문제 11-30
    {
      id: 'mv-q11',
      type: 'identify-part',
      question: '이동 조의 직선 운동을 안내하는 슬라이드 가이드를 클릭하세요.',
      partId: 'guide',
      correctAnswer: 'guide',
      explanation:
        '슬라이드 가이드는 이동 조의 직선 운동을 정밀하게 안내하는 역할을 합니다.',
      difficulty: 'easy',
    },
    {
      id: 'mv-q12',
      type: 'multiple-choice',
      question: '클램핑 조의 주요 역할은 무엇인가요?',
      options: [
        '가공물을 절삭',
        '가공물 표면 손상 방지',
        '나사 회전력 전달',
        '냉각수 공급',
      ],
      correctAnswer: 1,
      explanation:
        '클램핑 조는 교체 가능한 조 커버로, 가공물 표면의 손상을 방지하는 역할을 합니다.',
      difficulty: 'easy',
    },
    {
      id: 'mv-q13',
      type: 'true-false',
      question: '사다리꼴 나사는 볼 나사보다 효율이 높다.',
      options: ['O', 'X'],
      correctAnswer: 1,
      explanation:
        '볼 나사는 구르는 마찰을 이용하여 90% 이상의 효율을 보이지만, 사다리꼴 나사는 미끄러짐 마찰로 30~50% 수준입니다.',
      difficulty: 'hard',
    },
    {
      id: 'mv-q14',
      type: 'identify-part',
      question: '교체 가능한 클램핑 조 커버를 클릭하세요.',
      partId: 'clamping-jaw-1',
      correctAnswer: 'clamping-jaw-1',
      explanation:
        '클램핑 조는 교체 가능한 커버로, 마모 시 교체하여 가공 정밀도를 유지합니다.',
      difficulty: 'easy',
    },
    {
      id: 'mv-q15',
      type: 'multiple-choice',
      question: '바이스의 "기브(Gib)"의 역할은?',
      options: [
        '클램핑력 증가',
        '이동 조와 가이드 사이의 유격 제거',
        '나사 윤활',
        '가공물 냉각',
      ],
      correctAnswer: 1,
      explanation:
        '기브는 이동 조와 슬라이드 가이드 사이의 유격을 조절하여 가공 정밀도를 향상시킵니다.',
      difficulty: 'hard',
    },
    {
      id: 'mv-q16',
      type: 'true-false',
      question: '고정 조는 가공물의 기준면(Datum) 역할을 한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '고정 조는 항상 같은 위치에 있으므로 가공물 배치의 기준면으로 활용됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q17',
      type: 'identify-part',
      question: '리드 스크류를 지지하고 회전축을 안내하는 하우징을 클릭하세요.',
      partId: 'spindle-socket',
      correctAnswer: 'spindle-socket',
      explanation:
        '스핀들 소켓은 리드 스크류를 지지하고 회전축을 안내하는 하우징입니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q18',
      type: 'multiple-choice',
      question: '바이스에서 "스위블(Swivel)" 기능이란?',
      options: [
        '클램핑력 자동 조절',
        '바이스 베이스의 각도 회전 기능',
        '나사 자동 잠금',
        '가공물 자동 정렬',
      ],
      correctAnswer: 1,
      explanation:
        '스위블 기능은 바이스 베이스를 원하는 각도로 회전시켜 다양한 각도의 가공이 가능하게 합니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q19',
      type: 'true-false',
      question: '바이스의 클램핑력은 핸들에 가하는 토크에 비례한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        'F_clamp = T × (2π / p) × η 공식에서 클램핑력은 토크에 비례합니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q20',
      type: 'identify-part',
      question: '리드 스크류의 축방향 하중을 지지하는 추력 칼라를 클릭하세요.',
      partId: 'thrust-collar-1',
      correctAnswer: 'thrust-collar-1',
      explanation:
        '추력 칼라는 리드 스크류의 축방향 하중을 지지하는 황동 부품입니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q21',
      type: 'multiple-choice',
      question: '바이스의 고정 조와 이동 조 재질로 적합한 것은?',
      options: ['플라스틱', '알루미늄', '공구강', '구리'],
      correctAnswer: 2,
      explanation:
        '조(Jaw)는 마모에 강한 공구강을 경화 처리하여 사용합니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q22',
      type: 'true-false',
      question: '나사 피치가 작을수록 같은 토크로 더 큰 클램핑력을 얻을 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        'F = T × (2π / p)에서 피치(p)가 작을수록 기계적 이득이 커져 더 큰 클램핑력을 얻습니다.',
      difficulty: 'hard',
    },
    {
      id: 'mv-q23',
      type: 'identify-part',
      question: '반대쪽 클램핑 조 커버를 클릭하세요.',
      partId: 'clamping-jaw-2',
      correctAnswer: 'clamping-jaw-2',
      explanation:
        '두 번째 클램핑 조는 이동 조에 장착되어 가공물을 보호합니다.',
      difficulty: 'easy',
    },
    {
      id: 'mv-q24',
      type: 'multiple-choice',
      question: '정밀 바이스와 일반 바이스의 가장 큰 차이점은?',
      options: [
        '크기',
        '가이드 정밀도와 유격 관리',
        '색상',
        '무게',
      ],
      correctAnswer: 1,
      explanation:
        '정밀 바이스는 이동 조의 가이드 정밀도와 유격 관리가 더 엄격하여 높은 가공 정밀도를 보장합니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q25',
      type: 'true-false',
      question: '바이스 사용 시 가공물의 높이가 조의 높이보다 높으면 불안정할 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '가공물이 조보다 높이 올라오면 절삭력에 의한 모멘트가 커져 흔들림이 발생할 수 있습니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q26',
      type: 'identify-part',
      question: '주철로 제작된 슬라이드 가이드를 클릭하세요.',
      partId: 'guide',
      correctAnswer: 'guide',
      explanation:
        '슬라이드 가이드는 내마모성이 좋은 주철로 제작되어 정밀한 직선 운동을 안내합니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q27',
      type: 'multiple-choice',
      question: '유압 바이스의 장점은 무엇인가요?',
      options: [
        '구조가 단순하다',
        '일정하고 큰 클램핑력을 자동으로 제공',
        '가격이 저렴하다',
        '소형 가공에 적합하다',
      ],
      correctAnswer: 1,
      explanation:
        '유압 바이스는 유압 실린더를 이용하여 일정하고 큰 클램핑력을 자동으로 제공합니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q28',
      type: 'true-false',
      question: '추력 칼라는 황동으로 제작되어 마찰을 줄인다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '황동은 마찰 계수가 낮고 자기 윤활 특성이 있어 축방향 하중을 지지하면서 마찰을 줄입니다.',
      difficulty: 'medium',
    },
    {
      id: 'mv-q29',
      type: 'identify-part',
      question: '합금강으로 제작된 리드 스크류를 클릭하세요.',
      partId: 'lead-screw',
      correctAnswer: 'lead-screw',
      explanation:
        '리드 스크류는 높은 하중과 마모에 견디기 위해 합금강으로 제작됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'mv-q30',
      type: 'multiple-choice',
      question: '바이스로 얇은 가공물을 고정할 때 주의할 점은?',
      options: [
        '최대 토크로 조인다',
        '가공물 변형을 방지하기 위해 적정 클램핑력 유지',
        '고정 조만 사용한다',
        '바이스를 기울여 고정한다',
      ],
      correctAnswer: 1,
      explanation:
        '얇은 가공물은 과도한 클램핑력으로 변형될 수 있으므로 적정 힘으로 고정해야 합니다.',
      difficulty: 'easy',
    },
  ],
};
