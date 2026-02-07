'use client';

import { useState } from 'react';

const tabs = [
  { id: 'overview', label: '개요' },
  { id: 'components', label: '구성요소' },
  { id: 'physics', label: '비행 물리' },
];

interface DroneLearningPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DroneLearningPanel({ isOpen, onClose }: DroneLearningPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] bg-gray-900 shadow-2xl z-50 flex flex-col border-l border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">쿼드콥터 드론</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'components' && <ComponentsContent />}
        {activeTab === 'physics' && <PhysicsContent />}
      </div>
    </div>
  );
}

function OverviewContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-white">쿼드콥터 비행 원리</h3>

      <p className="text-gray-400 leading-relaxed">
        쿼드콥터는 4개의 로터(프로펠러)를 사용하여 양력, 방향, 기울기를 제어하는
        멀티로터 항공기입니다. 기존 헬리콥터와 달리 각 로터의 속도만으로
        모든 비행 제어가 가능합니다.
      </p>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-3">비행 제어 4가지</h4>
        <ol className="space-y-2 text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-green-400 font-mono">1.</span>
            <span><strong className="text-green-400">Throttle (스로틀)</strong> — 4개 모터 전체 출력. 상승/하강 제어</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400 font-mono">2.</span>
            <span><strong className="text-purple-400">Yaw (요)</strong> — CW/CCW 모터 쌍의 차동. 수평 회전</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 font-mono">3.</span>
            <span><strong className="text-blue-400">Pitch (피치)</strong> — 전/후 모터 쌍의 차동. 전진/후진</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400 font-mono">4.</span>
            <span><strong className="text-orange-400">Roll (롤)</strong> — 좌/우 모터 쌍의 차동. 좌우 이동</span>
          </li>
        </ol>
      </div>

      <div className="bg-blue-900/30 rounded-lg p-4">
        <h4 className="font-medium text-blue-300 mb-2">토크 밸런스</h4>
        <p className="text-blue-200/80">
          대각선 위치의 모터는 같은 방향(CW/CCW)으로 회전합니다.
          인접한 모터는 반대 방향으로 회전하여 반작용 토크를 상쇄합니다.
          이를 통해 안정적인 호버링이 가능합니다.
        </p>
      </div>

      <div className="bg-green-900/30 rounded-lg p-4">
        <h4 className="font-medium text-green-300 mb-2">직접 해보세요!</h4>
        <p className="text-green-200/80">
          스로틀을 올려 모터를 가동한 후, 요/피치/롤 슬라이더를 조절하여
          각 모터의 RPM 변화와 드론 기울기를 관찰하세요.
        </p>
      </div>
    </div>
  );
}

function ComponentsContent() {
  const components = [
    {
      name: '모터 (BLDC)',
      color: '#4488FF',
      description: '브러시리스 DC 모터. 각 암 끝에 장착되어 프로펠러를 직접 구동합니다. 높은 RPM과 토크를 제공합니다.',
    },
    {
      name: '프로펠러 (블레이드)',
      color: '#4488FF',
      description: '회전하여 양력을 발생시킵니다. CW/CCW 한 쌍으로 구성되어 토크를 상쇄합니다.',
    },
    {
      name: '메인 프레임',
      color: '#333333',
      description: '카본 파이버 재질의 중심 구조물. FC, 배터리, ESC 등 모든 전자부품이 장착됩니다.',
    },
    {
      name: '암 (Arm)',
      color: '#444444',
      description: 'X자 형태로 모터를 프레임에 연결하는 구조물입니다. 진동 감쇠가 중요합니다.',
    },
    {
      name: '기어링 시스템',
      color: '#44FF88',
      description: '모터 동력을 프로펠러에 전달하는 기어 장치입니다. 감속비를 통해 토크를 증가시킵니다.',
    },
    {
      name: 'ESC (전자변속기)',
      color: '#FF8844',
      description: '각 모터의 속도를 독립적으로 제어합니다. FC의 명령을 받아 모터에 전류를 공급합니다.',
    },
    {
      name: 'Flight Controller (FC)',
      color: '#FFCC00',
      description: '자이로/가속도 센서로 자세를 감지하고 PID 제어를 통해 모터 출력을 조정합니다.',
    },
  ];

  return (
    <div className="space-y-3 text-sm">
      <h3 className="text-lg font-semibold text-white mb-4">드론 구성요소</h3>
      {components.map((comp) => (
        <div key={comp.name} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: comp.color }} />
            <h4 className="font-medium text-white">{comp.name}</h4>
          </div>
          <p className="text-gray-400">{comp.description}</p>
        </div>
      ))}
    </div>
  );
}

function PhysicsContent() {
  return (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-semibold text-white">비행 물리</h3>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">모터 믹싱 매트릭스</h4>
        <div className="bg-gray-900 rounded p-3 font-mono text-xs text-gray-300 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-gray-500">
                <td className="pr-2"></td>
                <td className="px-2 text-center">M1(NW)</td>
                <td className="px-2 text-center">M2(NE)</td>
                <td className="px-2 text-center">M3(SE)</td>
                <td className="px-2 text-center">M4(SW)</td>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr><td className="pr-2 text-green-400">Throttle</td><td className="text-center">+</td><td className="text-center">+</td><td className="text-center">+</td><td className="text-center">+</td></tr>
              <tr><td className="pr-2 text-blue-400">Pitch</td><td className="text-center">-</td><td className="text-center">-</td><td className="text-center">+</td><td className="text-center">+</td></tr>
              <tr><td className="pr-2 text-orange-400">Roll</td><td className="text-center">+</td><td className="text-center">-</td><td className="text-center">-</td><td className="text-center">+</td></tr>
              <tr><td className="pr-2 text-purple-400">Yaw</td><td className="text-center">+</td><td className="text-center">-</td><td className="text-center">+</td><td className="text-center">-</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-400 mt-2">
          각 파라미터의 +/- 부호는 해당 모터의 RPM을 기본값 대비 증감시킵니다.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">추력 공식</h4>
        <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-300">
          T = k_T &times; &rho; &times; n&sup2; &times; D&sup4;
        </div>
        <p className="text-gray-400 mt-2">
          추력(T)은 회전속도(n)의 제곱에 비례합니다.
          k_T는 추력계수, &rho;는 공기밀도, D는 프로펠러 직경입니다.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">토크 밸런스</h4>
        <p className="text-gray-400">
          CW 회전 모터(M1, M3)와 CCW 회전 모터(M2, M4)의 토크 합이 0이면
          기체는 수평 회전하지 않습니다. Yaw 입력은 이 밸런스를 의도적으로
          깨뜨려 수평 회전을 발생시킵니다.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-4">
        <h4 className="font-medium text-white mb-2">호버링 조건</h4>
        <div className="bg-gray-900 rounded p-3 font-mono text-sm text-gray-300">
          &Sigma;T &times; cos(&theta;) = m &times; g
        </div>
        <p className="text-gray-400 mt-2">
          총 추력의 수직 성분이 드론 무게와 같을 때 호버링합니다.
          기울어지면 cos(&theta;)로 양력이 감소하므로 스로틀을 올려야 합니다.
        </p>
      </div>

      <div className="bg-purple-900/30 rounded-lg p-4">
        <h4 className="font-medium text-purple-300 mb-2">핵심 관계</h4>
        <ul className="text-purple-200/80 space-y-1">
          <li>• Throttle ↑ → 전체 RPM ↑ → 추력 ↑ → 상승</li>
          <li>• Yaw ↑ → CW 모터 ↑, CCW 모터 ↓ → 수평 회전</li>
          <li>• Pitch ↑ → 후방 모터 ↑, 전방 모터 ↓ → 전진</li>
          <li>• Roll ↑ → 좌측 모터 ↑, 우측 모터 ↓ → 우측 이동</li>
        </ul>
      </div>
    </div>
  );
}
