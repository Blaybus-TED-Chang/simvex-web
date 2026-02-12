import { ModelQuiz } from './types';

export const v4EngineCombinedQuiz: ModelQuiz = {
  modelId: 'v4-engine-combined',
  titleKo: 'V4 실린더 엔진 이해도 퀴즈',
  description: 'V4 실린더 엔진의 구조와 4행정 사이클 원리를 확인해보세요.',
  questions: [
    // 1. 객관식 - 4행정 사이클
    {
      id: 'v4-q1',
      type: 'multiple-choice',
      question: '4행정 사이클의 올바른 순서는?',
      options: [
        '흡입 → 폭발 → 압축 → 배기',
        '흡입 → 압축 → 폭발 → 배기',
        '압축 → 흡입 → 배기 → 폭발',
        '폭발 → 배기 → 흡입 → 압축',
      ],
      correctAnswer: 1,
      explanation:
        '4행정 사이클은 흡입(Intake) → 압축(Compression) → 폭발(Power) → 배기(Exhaust) 순서로 작동합니다.',
      difficulty: 'easy',
    },
    // 2. O/X - 크랭크샤프트 역할
    {
      id: 'v4-q2',
      type: 'true-false',
      question: '크랭크샤프트는 피스톤의 직선 왕복 운동을 회전 운동으로 변환한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '크랭크샤프트는 커넥팅 로드를 통해 전달된 피스톤의 직선 왕복 운동을 회전 운동으로 변환하는 핵심 부품입니다.',
      difficulty: 'easy',
    },
    // 3. 부품 클릭 - 크랭크샤프트
    {
      id: 'v4-q3',
      type: 'identify-part',
      question: '엔진의 출력축 역할을 하는 크랭크샤프트를 클릭하세요.',
      partId: 'crankshaft-1',
      correctAnswer: 'crankshaft-1',
      explanation:
        '크랭크샤프트는 피스톤의 왕복 운동을 회전 운동으로 변환하는 엔진의 출력축입니다.',
      difficulty: 'easy',
    },
    // 4. 객관식 - 실린더 배열
    {
      id: 'v4-q4',
      type: 'multiple-choice',
      question: 'V4 엔진에서 "V"가 의미하는 것은?',
      options: [
        '실린더의 개수',
        '실린더의 V자 배열 형태',
        '밸브의 종류',
        '엔진의 배기량',
      ],
      correctAnswer: 1,
      explanation:
        'V4에서 "V"는 실린더가 V자 형태로 배열된 것을 의미하고, "4"는 실린더의 개수입니다.',
      difficulty: 'easy',
    },
    // 5. 부품 클릭 - 피스톤
    {
      id: 'v4-q5',
      type: 'identify-part',
      question: '실린더 내에서 왕복 운동하는 피스톤을 클릭하세요.',
      partId: 'piston-1',
      correctAnswer: 'piston-1',
      explanation:
        '피스톤은 실린더 내에서 왕복 운동하며 연소 가스의 압력을 받아 동력을 전달합니다.',
      difficulty: 'easy',
    },
    // 6. O/X - 카운터웨이트
    {
      id: 'v4-q6',
      type: 'true-false',
      question: '크랭크샤프트의 카운터웨이트는 회전 시 진동을 감소시키는 역할을 한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '카운터웨이트(균형추)는 크랭크샤프트 회전 시 발생하는 불균형을 상쇄하여 진동을 줄입니다.',
      difficulty: 'easy',
    },
    // 7. 부품 클릭 - 커넥팅 로드
    {
      id: 'v4-q7',
      type: 'identify-part',
      question: '피스톤과 크랭크샤프트를 연결하는 커넥팅 로드를 클릭하세요.',
      partId: 'connecting-rod-1',
      correctAnswer: 'connecting-rod-1',
      explanation:
        '커넥팅 로드는 피스톤의 왕복 운동을 크랭크샤프트의 회전 운동으로 전달하는 연결 부품입니다.',
      difficulty: 'easy',
    },
    // 8. 객관식 - 배기량 공식
    {
      id: 'v4-q8',
      type: 'multiple-choice',
      question: '배기량(V) 계산에 필요하지 않은 요소는?',
      options: ['실린더 직경(D)', '행정(S)', '실린더 수(n)', '엔진 RPM'],
      correctAnswer: 3,
      explanation:
        '배기량 V = (π/4) × D² × S × n에서 실린더 직경, 행정, 실린더 수가 필요하며, RPM은 관련 없습니다.',
      difficulty: 'medium',
    },
    // 9. 부품 클릭 - 피스톤 링
    {
      id: 'v4-q9',
      type: 'identify-part',
      question: '피스톤과 실린더 벽 사이의 기밀을 유지하는 피스톤 링을 클릭하세요.',
      partId: 'piston-ring-1',
      correctAnswer: 'piston-ring-1',
      explanation:
        '피스톤 링은 피스톤과 실린더 벽 사이의 기밀을 유지하고 오일을 조절하는 역할을 합니다.',
      difficulty: 'easy',
    },
    // 10. O/X - 압축비
    {
      id: 'v4-q10',
      type: 'true-false',
      question: '압축비가 높을수록 열효율이 일반적으로 증가한다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '압축비가 높을수록 이론적 열효율이 증가하지만, 너무 높으면 노킹이 발생할 수 있습니다.',
      difficulty: 'medium',
    },
    // 추가 문제 11-30
    {
      id: 'v4-q11',
      type: 'identify-part',
      question: '크랭크샤프트의 균형추(카운터웨이트) 부분을 클릭하세요.',
      partId: 'crankshaft-2',
      correctAnswer: 'crankshaft-2',
      explanation:
        '카운터웨이트는 크랭크샤프트의 균형추로, 회전 시 진동을 감소시킵니다.',
      difficulty: 'easy',
    },
    {
      id: 'v4-q12',
      type: 'multiple-choice',
      question: '4행정 엔진에서 크랭크샤프트는 한 사이클 동안 몇 회전 하나요?',
      options: ['0.5회전', '1회전', '2회전', '4회전'],
      correctAnswer: 2,
      explanation:
        '4행정(흡입-압축-폭발-배기)은 피스톤 4번 운동 = 크랭크샤프트 2회전(720°)입니다.',
      difficulty: 'medium',
    },
    {
      id: 'v4-q13',
      type: 'true-false',
      question: '커넥팅 로드의 빅엔드(큰 쪽 끝)는 크랭크샤프트에 연결된다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '커넥팅 로드의 빅엔드는 크랭크샤프트의 크랭크핀에, 스몰엔드는 피스톤 핀에 연결됩니다.',
      difficulty: 'medium',
    },
    {
      id: 'v4-q14',
      type: 'identify-part',
      question: '커넥팅 로드의 빅엔드를 크랭크샤프트에 고정하는 캡을 클릭하세요.',
      partId: 'rod-cap-1',
      correctAnswer: 'rod-cap-1',
      explanation:
        '로드 캡은 커넥팅 로드의 빅엔드를 크랭크샤프트에 고정하는 부품입니다.',
      difficulty: 'medium',
    },
    {
      id: 'v4-q15',
      type: 'multiple-choice',
      question: '피스톤 링의 종류가 아닌 것은?',
      options: ['컴프레션 링', '오일 링', '스크레이퍼 링', '플라이 링'],
      correctAnswer: 3,
      explanation:
        '피스톤 링은 컴프레션 링(기밀 유지), 오일 링(윤활유 조절), 스크레이퍼 링(오일 제거) 등이 있습니다.',
      difficulty: 'medium',
    },
    {
      id: 'v4-q16',
      type: 'true-false',
      question: 'V형 엔진은 직렬 엔진에 비해 엔진 길이가 짧다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        'V형 배열은 실린더를 양쪽에 나누어 배치하므로 직렬 엔진보다 길이가 짧아 컴팩트합니다.',
      difficulty: 'medium',
    },
    {
      id: 'v4-q17',
      type: 'identify-part',
      question: '알루미늄 합금으로 제작된 피스톤을 클릭하세요.',
      partId: 'piston-2',
      correctAnswer: 'piston-2',
      explanation:
        '피스톤은 가볍고 열전도율이 높은 알루미늄 합금으로 제작되어 왕복 관성을 줄입니다.',
      difficulty: 'easy',
    },
    {
      id: 'v4-q18',
      type: 'multiple-choice',
      question: '엔진의 "토크(Torque)"란 무엇인가요?',
      options: [
        '단위 시간당 한 일의 양',
        '회전력의 크기',
        '피스톤의 속도',
        '연료 소비량',
      ],
      correctAnswer: 1,
      explanation:
        '토크는 크랭크샤프트의 회전력 크기로, T = F × r (F: 폭발력, r: 크랭크 반경)입니다.',
      difficulty: 'medium',
    },
    {
      id: 'v4-q19',
      type: 'true-false',
      question: '피스톤은 연소실에서 가장 높은 온도와 압력을 직접 받는 부품이다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '피스톤 상면은 연소 가스의 고온·고압에 직접 노출되므로 내열성이 중요합니다.',
      difficulty: 'easy',
    },
    {
      id: 'v4-q20',
      type: 'identify-part',
      question: '주철로 제작된 기밀 유지 부품을 클릭하세요.',
      partId: 'piston-ring-5',
      correctAnswer: 'piston-ring-5',
      explanation:
        '피스톤 링은 내마모성이 높은 주철로 제작되어 실린더 벽과의 기밀을 유지합니다.',
      difficulty: 'medium',
    },
    {
      id: 'v4-q21',
      type: 'multiple-choice',
      question: 'V4 엔진의 일반적인 뱅크 각도(V-angle)는?',
      options: ['30°', '60°', '90°', '180°'],
      correctAnswer: 2,
      explanation:
        'V4 엔진은 보통 60° 또는 90° 뱅크 각도를 사용하며, 90°가 가장 일반적입니다.',
      difficulty: 'hard',
    },
    {
      id: 'v4-q22',
      type: 'true-false',
      question: '커넥팅 로드는 인장과 압축 하중을 모두 받는다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '커넥팅 로드는 폭발 행정에서 압축, 흡입 행정에서 인장 하중을 받으므로 단조강으로 제작됩니다.',
      difficulty: 'hard',
    },
    {
      id: 'v4-q23',
      type: 'identify-part',
      question: '단조강으로 제작된 커넥팅 로드를 클릭하세요.',
      partId: 'connecting-rod-3',
      correctAnswer: 'connecting-rod-3',
      explanation:
        '커넥팅 로드는 높은 인장·압축 하중을 견디기 위해 단조강으로 제작됩니다.',
      difficulty: 'easy',
    },
    {
      id: 'v4-q24',
      type: 'multiple-choice',
      question: '엔진의 "마력(HP)"은 어떻게 계산하나요?',
      options: [
        'HP = 토크 × RPM',
        'HP = (토크 × RPM) / 5252',
        'HP = 배기량 × 압축비',
        'HP = 피스톤 수 × 행정',
      ],
      correctAnswer: 1,
      explanation:
        '마력은 HP = (토크 × RPM) / 5252로 계산됩니다. 토크와 회전수가 동시에 높아야 높은 출력을 냅니다.',
      difficulty: 'hard',
    },
    {
      id: 'v4-q25',
      type: 'true-false',
      question: '피스톤 링이 마모되면 엔진 오일 소비가 증가할 수 있다.',
      options: ['O', 'X'],
      correctAnswer: 0,
      explanation:
        '피스톤 링이 마모되면 기밀성이 떨어져 오일이 연소실로 유입되어 오일 소비가 증가합니다.',
      difficulty: 'medium',
    },
    {
      id: 'v4-q26',
      type: 'identify-part',
      question: '로드 캡을 클릭하세요.',
      partId: 'rod-cap-2',
      correctAnswer: 'rod-cap-2',
      explanation:
        '로드 캡은 커넥팅 로드의 빅엔드를 크랭크샤프트에 고정하는 캡입니다.',
      difficulty: 'easy',
    },
    {
      id: 'v4-q27',
      type: 'multiple-choice',
      question: '노킹(Knocking)이란 무엇인가요?',
      options: [
        '엔진 오일 부족 현상',
        '연료의 비정상적 자기 점화',
        '배기 가스 역류',
        '냉각수 과열',
      ],
      correctAnswer: 1,
      explanation:
        '노킹은 압축비가 너무 높거나 점화 시기가 부적절할 때 연료가 비정상적으로 자기 점화하는 현상입니다.',
      difficulty: 'hard',
    },
    {
      id: 'v4-q28',
      type: 'true-false',
      question: 'V4 엔진은 4기통 직렬 엔진보다 일반적으로 진동이 적다.',
      options: ['O', 'X'],
      correctAnswer: 1,
      explanation:
        '4기통 직렬 엔진은 1차 관성력이 완전히 균형 잡히므로 V4보다 진동 면에서 유리합니다.',
      difficulty: 'hard',
    },
    {
      id: 'v4-q29',
      type: 'identify-part',
      question: '4번째 피스톤을 클릭하세요.',
      partId: 'piston-4',
      correctAnswer: 'piston-4',
      explanation:
        '피스톤 4는 V4 엔진의 네 번째 실린더에서 왕복 운동하는 부품입니다.',
      difficulty: 'easy',
    },
    {
      id: 'v4-q30',
      type: 'multiple-choice',
      question: '압축비(r)의 정의는?',
      options: [
        'r = 행정 체적 / 연소실 체적',
        'r = (행정 체적 + 연소실 체적) / 연소실 체적',
        'r = 연소실 체적 / 행정 체적',
        'r = 실린더 직경 / 행정',
      ],
      correctAnswer: 1,
      explanation:
        '압축비 r = (V₁ + V₂) / V₂ (V₁: 행정 체적, V₂: 연소실 체적)입니다.',
      difficulty: 'hard',
    },
  ],
};
