import { ModelQuiz } from './types';

export const leafSpringCombinedQuiz: ModelQuiz = {
  modelId: 'leaf-spring-combined',
  titleKo: '판스프링 서스펜션 이해도 퀴즈',
  description: '트럭과 상용차에서 사용되는 판스프링 서스펜션의 구조와 원리를 확인해보세요.',
  questions: [
    // 1. 객관식 - 용도
    {
      id: 'ls-q1',
      type: 'multiple-choice',
      question: '판스프링 서스펜션이 주로 사용되는 차량은?',
      options: ['스포츠카', '경차', '트럭 및 상용차', '오토바이'],
      correctAnswer: 2,
      explanation:
        '판스프링은 높은 하중 지지력 덕분에 트럭, 버스 등 상용차에서 널리 사용됩니다.',
      difficulty: 'easy',
    },
    // 2. O/X - 층간 마찰
    {
      id: 'ls-q2',
      type: 'true-false',
      question: '판스프링은 판들 사이의 마찰로 인해 별도의 댐퍼 없이도 진동 감쇠 효과가 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '층간 마찰이 진동을 감쇠시키는 역할을 하여, 간단한 시스템에서는 별도 댐퍼 없이 사용되기도 합니다.',
      difficulty: 'medium',
    },
    // 3. 부품 클릭 - 판스프링 팩
    {
      id: 'ls-q3',
      type: 'identify-part',
      question: '여러 장의 판이 겹쳐진 핵심 스프링 부품을 클릭하세요.',
      partId: 'leaf-layer',
      correctAnswer: 'leaf-layer',
      explanation:
        '판스프링 팩은 여러 장의 판 스프링이 겹쳐진 핵심 부품으로, 가장 긴 판이 메인 리프입니다.',
      difficulty: 'easy',
    },
    // 4. 객관식 - 스프링 상수 공식
    {
      id: 'ls-q4',
      type: 'multiple-choice',
      question: '판스프링의 스프링 상수(k)에 영향을 주는 요소가 아닌 것은?',
      options: ['판의 두께(t)', '판의 길이(L)', '탄성계수(E)', '차량 속도'],
      correctAnswer: 3,
      explanation:
        '스프링 상수 k = (Ebt³)/(4L³)에서 탄성계수, 폭, 두께, 길이가 영향을 주며, 차량 속도는 관련 없습니다.',
      difficulty: 'medium',
    },
    // 5. 부품 클릭 - 센터 클램프
    {
      id: 'ls-q5',
      type: 'identify-part',
      question: '판스프링 중앙을 액슬에 고정하는 U볼트 클램프를 클릭하세요.',
      partId: 'clamp-center',
      correctAnswer: 'clamp-center',
      explanation:
        '센터 클램프는 판스프링 중앙을 고정하는 U볼트 형태의 클램프로, 액슬에 연결됩니다.',
      difficulty: 'easy',
    },
    // 6. O/X - 점진적 스프링율
    {
      id: 'ls-q6',
      type: 'true-false',
      question: '판스프링은 하중이 증가해도 스프링 상수가 일정하게 유지된다.',
      options: ['O', 'X'],
      correctAnswer: 1,
      explanation:
        '판스프링은 하중에 따라 유효 길이가 변화하여 점진적 스프링율 특성을 보입니다. 이는 다양한 하중 조건에 적응할 수 있게 합니다.',
      difficulty: 'medium',
    },
    // 7. 부품 클릭 - 러버 부싱
    {
      id: 'ls-q7',
      type: 'identify-part',
      question: '금속 간 충격을 흡수하고 소음을 줄이는 고무 부품을 클릭하세요.',
      partId: 'support-rubber',
      correctAnswer: 'support-rubber',
      explanation:
        '러버 부싱은 금속 부품 사이에서 충격을 흡수하고 소음과 진동을 감소시키는 고무 부품입니다.',
      difficulty: 'easy',
    },
    // 8. 객관식 - 에너지 저장
    {
      id: 'ls-q8',
      type: 'multiple-choice',
      question: '판스프링이 충격을 흡수할 때 에너지는 어떤 형태로 저장되나요?',
      options: ['열에너지', '탄성 변형 에너지', '운동 에너지', '전기 에너지'],
      correctAnswer: 1,
      explanation:
        '하중이 가해지면 판이 휘어지며 탄성 변형 에너지로 저장됩니다. 각 판이 독립적으로 변형하여 충격을 분산합니다.',
      difficulty: 'easy',
    },
    // 9. 부품 클릭 - 스프링 행거
    {
      id: 'ls-q9',
      type: 'identify-part',
      question: '판스프링의 끝을 차체 프레임에 연결하는 브라켓을 클릭하세요.',
      partId: 'support',
      correctAnswer: 'support',
      explanation:
        '스프링 행거는 판스프링의 끝을 차체 프레임에 연결하는 브라켓으로, 하중을 전달합니다.',
      difficulty: 'medium',
    },
    // 10. O/X - 재질
    {
      id: 'ls-q10',
      type: 'true-false',
      question: '판스프링은 일반적으로 알루미늄 합금으로 제작된다.',
      options: ['O', 'X'],
      correctAnswer: 1,
      explanation:
        '판스프링은 높은 피로 강도와 탄성을 위해 스프링 강(spring steel)으로 제작됩니다.',
      difficulty: 'easy',
    },
    // 추가 문제 11-30
    {
      id: 'ls-q11',
      type: 'identify-part',
      question: '판스프링 전단부를 고정하는 1차 클램프를 클릭하세요.',
      partId: 'clamp-primary',
      correctAnswer: 'clamp-primary',
      explanation:
        '1차 클램프는 판스프링의 전단부를 고정하여 판들이 분리되지 않게 합니다.',
      difficulty: 'easy',
    },
    {
      id: 'ls-q12',
      type: 'multiple-choice',
      question: '판스프링에서 "메인 리프(Main Leaf)"란 무엇인가요?',
      options: [
        '가장 짧은 판',
        '가장 긴 판',
        '중간 크기의 판',
        '가장 두꺼운 판',
      ],
      correctAnswer: 1,
      explanation:
        '메인 리프는 가장 긴 판으로, 양쪽 끝에 아이(eye)가 있어 차체에 연결됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'ls-q13',
      type: 'true-false',
      question: '판스프링의 판 개수가 많을수록 스프링 상수가 증가한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '판의 개수가 증가하면 전체 스프링 상수가 증가하여 더 큰 하중을 지지할 수 있습니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q14',
      type: 'identify-part',
      question: '판스프링 후단부를 고정하는 2차 클램프를 클릭하세요.',
      partId: 'clamp-secondary',
      correctAnswer: 'clamp-secondary',
      explanation:
        '2차 클램프는 판스프링의 후단부를 고정합니다.',
      difficulty: 'easy',
    },
    {
      id: 'ls-q15',
      type: 'multiple-choice',
      question: '판스프링 서스펜션의 장점이 아닌 것은?',
      options: [
        '높은 하중 지지력',
        '간단한 구조',
        '부드러운 승차감',
        '자체 감쇠 기능',
      ],
      correctAnswer: 2,
      explanation:
        '판스프링은 코일 스프링에 비해 승차감이 거칠어 주로 상용차에 사용됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q16',
      type: 'true-false',
      question: '판스프링은 코일 스프링보다 옆 방향 안정성이 우수하다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '판스프링은 길이 방향으로 강성이 있어 별도의 링크 없이도 옆 방향 안정성을 제공합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q17',
      type: 'identify-part',
      question: '60mm 직경의 대형 러버 부싱을 클릭하세요.',
      partId: 'support-rubber-60mm',
      correctAnswer: 'support-rubber-60mm',
      explanation:
        '대형 러버 부싱(60mm)은 큰 하중을 견디는 대형 차량에 사용됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q18',
      type: 'multiple-choice',
      question: '판스프링의 "캠버(Camber)"란 무엇인가요?',
      options: [
        '판의 두께',
        '판의 초기 곡률',
        '판의 길이',
        '판의 폭',
      ],
      correctAnswer: 1,
      explanation:
        '캠버는 무부하 상태에서 판스프링이 가지는 초기 곡률(휨 정도)입니다.',
      difficulty: 'hard',
    },
    {
      id: 'ls-q19',
      type: 'true-false',
      question: '판스프링에 윤활제를 바르면 층간 마찰이 감소하여 감쇠력이 줄어든다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '윤활제는 층간 마찰을 줄여 소음을 방지하지만, 동시에 감쇠력도 감소시킵니다.',
      difficulty: 'hard',
    },
    {
      id: 'ls-q20',
      type: 'identify-part',
      question: '스프링 행거를 차체 프레임에 고정하는 샤시 마운트를 클릭하세요.',
      partId: 'support-chassis',
      correctAnswer: 'support-chassis',
      explanation:
        '샤시 마운트는 스프링 행거를 차체 프레임에 단단히 고정하는 역할을 합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q21',
      type: 'multiple-choice',
      question: '판스프링의 파손 원인으로 가장 흔한 것은?',
      options: ['과열', '피로 파괴', '부식', '충격'],
      correctAnswer: 1,
      explanation:
        '반복적인 하중으로 인한 피로 파괴가 판스프링 파손의 가장 흔한 원인입니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q22',
      type: 'true-false',
      question: '판스프링은 압축과 인장 모두에서 탄성력을 발휘한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '판스프링은 휘어질 때 상부는 압축, 하부는 인장 응력을 받으며 탄성 에너지를 저장합니다.',
      difficulty: 'hard',
    },
    {
      id: 'ls-q23',
      type: 'identify-part',
      question: '고정형(피벗 없는) 샤시 마운트를 클릭하세요.',
      partId: 'support-chassis-rigid',
      correctAnswer: 'support-chassis-rigid',
      explanation:
        '고정 샤시 마운트는 피벗 운동 없이 후단을 고정하는 마운트입니다.',
      difficulty: 'hard',
    },
    {
      id: 'ls-q24',
      type: 'multiple-choice',
      question: '헬퍼 스프링(Helper Spring)의 역할은 무엇인가요?',
      options: [
        '항상 작동하는 보조 스프링',
        '일정 하중 이상에서만 작동',
        '감쇠력 증가',
        '소음 감소',
      ],
      correctAnswer: 1,
      explanation:
        '헬퍼 스프링은 일정 하중 이상에서만 접촉하여 작동하며, 과적 시 추가 지지력을 제공합니다.',
      difficulty: 'hard',
    },
    {
      id: 'ls-q25',
      type: 'true-false',
      question: '판스프링은 차축의 위치를 결정하는 역할도 한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '판스프링은 충격 흡수뿐 아니라 차축을 차체에 대해 정확한 위치에 유지하는 역할도 합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q26',
      type: 'identify-part',
      question: '판스프링 뒤쪽의 스프링 행거를 클릭하세요.',
      partId: 'support-rear',
      correctAnswer: 'support-rear',
      explanation:
        '후방 스프링 행거는 판스프링의 뒤쪽 끝을 차체 프레임에 연결합니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q27',
      type: 'multiple-choice',
      question: '판스프링의 "아이(Eye)"는 어디에 있나요?',
      options: [
        '메인 리프의 양쪽 끝',
        '판스프링 중앙',
        '각 판의 끝',
        '클램프 위치',
      ],
      correctAnswer: 0,
      explanation:
        '아이는 메인 리프의 양쪽 끝에 있는 고리 형태로, 차체에 연결되는 부분입니다.',
      difficulty: 'medium',
    },
    {
      id: 'ls-q28',
      type: 'true-false',
      question: '파라볼릭 판스프링은 일반 판스프링보다 가볍다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '파라볼릭 판스프링은 테이퍼 형상으로 제작되어 적은 판으로도 동등한 성능을 내며 더 가볍습니다.',
      difficulty: 'hard',
    },
    {
      id: 'ls-q29',
      type: 'identify-part',
      question: '후방에 대칭으로 위치한 1차 클램프를 클릭하세요.',
      partId: 'clamp-primary-rear',
      correctAnswer: 'clamp-primary-rear',
      explanation:
        '1차 클램프(후방 대칭)는 판스프링 반대쪽을 고정하는 대칭 클램프입니다.',
      difficulty: 'hard',
    },
    {
      id: 'ls-q30',
      type: 'multiple-choice',
      question: '판스프링의 층간에 삽입하는 재료의 목적은?',
      options: [
        '마찰 증가',
        '마찰 감소 및 소음 방지',
        '강도 증가',
        '무게 증가',
      ],
      correctAnswer: 1,
      explanation:
        '층간 삽입재(인터리프)는 마찰을 조절하고 삐걱거리는 소음을 방지합니다.',
      difficulty: 'medium',
    },
  ],
};
