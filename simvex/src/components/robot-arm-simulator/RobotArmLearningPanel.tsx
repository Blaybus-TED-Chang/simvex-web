'use client';

import { useState } from 'react';
import { JOINT_CONFIGS, DH_PARAMS } from '@/types/robot';

const tabs = [
  { id: 'overview', label: '개요' },
  { id: 'joints', label: '관절 구조' },
  { id: 'kinematics', label: '운동학' },
];

interface RobotArmLearningPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

export default function RobotArmLearningPanel({ isOpen, onClose, isDarkMode }: RobotArmLearningPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-[420px] ${isDarkMode ? 'bg-gray-900' : 'bg-white'} shadow-2xl z-50 flex flex-col border-l ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6축 로봇 팔</h2>
        <button
          onClick={onClose}
          className={`p-1 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} rounded transition-colors`}
        >
          <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : isDarkMode
                  ? 'text-gray-500 hover:text-gray-300'
                  : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && <OverviewContent isDarkMode={isDarkMode} />}
        {activeTab === 'joints' && <JointsContent isDarkMode={isDarkMode} />}
        {activeTab === 'kinematics' && <KinematicsContent isDarkMode={isDarkMode} />}
      </div>
    </div>
  );
}

function OverviewContent({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>6축 다관절 로봇 팔</h3>

      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
        6축 로봇 팔(6-DOF Articulated Robot)은 산업 현장에서 가장 널리 사용되는 로봇 형태입니다.
        6개의 회전 관절(Joint)을 통해 3차원 공간에서 위치(XYZ)와 방향(Roll, Pitch, Yaw)을 자유롭게 제어할 수 있습니다.
      </p>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>자유도 (DOF)</h4>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          <strong className="text-blue-400">자유도(Degrees of Freedom)</strong>는 로봇이 독립적으로 움직일 수 있는 축의 수입니다.
          3차원 공간에서 물체의 자세를 완전히 정의하려면 6개의 자유도가 필요합니다:
        </p>
        <ul className={`mt-2 space-y-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <li>- 위치: X, Y, Z (3 DOF)</li>
          <li>- 방향: Roll, Pitch, Yaw (3 DOF)</li>
        </ul>
      </div>

      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>응용 분야</h4>
        <ul className={`space-y-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <li className="flex items-start gap-2">
            <span className="text-green-400">1.</span>
            <span><strong className="text-green-400">용접</strong> — 자동차 차체 등 정밀 아크/스팟 용접</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400">2.</span>
            <span><strong className="text-blue-400">조립</strong> — 전자부품 삽입, 나사 체결 등</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-orange-400">3.</span>
            <span><strong className="text-orange-400">도장</strong> — 균일한 페인트 도포</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-400">4.</span>
            <span><strong className="text-purple-400">Pick & Place</strong> — 물류 및 포장 자동화</span>
          </li>
        </ul>
      </div>

      <div className={`${isDarkMode ? 'bg-green-900/30' : 'bg-green-50'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-green-300' : 'text-green-700'} mb-2`}>직접 해보세요!</h4>
        <p className={isDarkMode ? 'text-green-200/80' : 'text-green-700/80'}>
          FK 모드에서 각 관절 슬라이더를 조절하여 로봇 팔의 자세를 변경하거나,
          IK 모드에서 목표 좌표를 입력하여 자동으로 관절 각도가 계산되는 것을 관찰하세요.
        </p>
      </div>
    </div>
  );
}

function JointsContent({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>관절 구조</h3>

      {/* Joint cards */}
      {JOINT_CONFIGS.map((joint, i) => (
        <div key={joint.id} className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: joint.color }} />
            <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              J{i + 1}: {joint.name}
            </h4>
            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
              {joint.axis.toUpperCase()}축
            </span>
          </div>
          <div className={`grid grid-cols-3 gap-2 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <div>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>범위</span>
              <div className="font-mono">{joint.min}° ~ {joint.max}°</div>
            </div>
            <div>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>링크 길이</span>
              <div className="font-mono">{joint.length}m</div>
            </div>
            <div>
              <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>기본 각도</span>
              <div className="font-mono">{joint.defaultAngle}°</div>
            </div>
          </div>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {jointDescriptions[i]}
          </p>
        </div>
      ))}

      {/* DH Parameters Table */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>DH 파라미터</h4>
        <div className="overflow-x-auto">
          <table className={`w-full text-xs font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <thead>
              <tr className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                <td className="pr-3 pb-2">관절</td>
                <td className="px-2 pb-2 text-center">d (m)</td>
                <td className="px-2 pb-2 text-center">a (m)</td>
                <td className="px-2 pb-2 text-center">&alpha; (rad)</td>
              </tr>
            </thead>
            <tbody>
              {DH_PARAMS.map((p, i) => (
                <tr key={i} className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                  <td className="pr-3 py-1" style={{ color: JOINT_CONFIGS[i].color }}>J{i + 1}</td>
                  <td className="px-2 py-1 text-center">{p.d.toFixed(2)}</td>
                  <td className="px-2 py-1 text-center">{p.a.toFixed(2)}</td>
                  <td className="px-2 py-1 text-center">{p.alpha.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KinematicsContent({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className="space-y-4 text-sm">
      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>로봇 운동학</h3>

      {/* FK */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>순기구학 (Forward Kinematics)</h4>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          각 관절 각도(&theta;)가 주어지면 엔드이펙터의 위치와 방향을 계산합니다.
          DH(Denavit-Hartenberg) 변환 행렬을 순차적으로 곱합니다.
        </p>
        <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded p-3 font-mono text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-3`}>
          T = T&#8321; &times; T&#8322; &times; T&#8323; &times; T&#8324; &times; T&#8325; &times; T&#8326;
        </div>
      </div>

      {/* DH Matrix */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>DH 변환 행렬</h4>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
          각 관절의 변환은 4개의 DH 파라미터(&theta;, d, a, &alpha;)로 정의됩니다:
        </p>
        <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded p-3 font-mono text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} overflow-x-auto leading-relaxed`}>
          <div>T&#7522; = Rot_z(&theta;) &times; Trans_z(d) &times; Trans_x(a) &times; Rot_x(&alpha;)</div>
          <div className="mt-2">
            | c&theta; -s&theta;&middot;c&alpha;  s&theta;&middot;s&alpha;  a&middot;c&theta; |
          </div>
          <div>
            | s&theta;  c&theta;&middot;c&alpha; -c&theta;&middot;s&alpha;  a&middot;s&theta; |
          </div>
          <div>
            |  0     s&alpha;       c&alpha;       d    |
          </div>
          <div>
            |  0       0          0        1    |
          </div>
        </div>
        <p className={`mt-2 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          c&theta; = cos(&theta;), s&theta; = sin(&theta;), c&alpha; = cos(&alpha;), s&alpha; = sin(&alpha;)
        </p>
      </div>

      {/* IK */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>역기구학 (Inverse Kinematics)</h4>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          목표 위치(x, y, z)가 주어지면 그 위치에 도달하기 위한 관절 각도를 역으로 계산합니다.
          본 시뮬레이터는 <strong className="text-blue-400">CCD (Cyclic Coordinate Descent)</strong> 알고리즘을 사용합니다.
        </p>
      </div>

      <div className={`${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} mb-2`}>CCD 알고리즘</h4>
        <ol className={`space-y-2 ${isDarkMode ? 'text-blue-200/80' : 'text-blue-700/80'}`}>
          <li>1. 엔드이펙터에서 가장 가까운 관절(J6)부터 시작</li>
          <li>2. 해당 관절에서 엔드이펙터→목표 방향으로 회전 각도 계산</li>
          <li>3. 관절 제한 범위 내에서 각도 적용</li>
          <li>4. 다음 관절(J5, J4, ...)로 이동하여 반복</li>
          <li>5. 베이스(J1)까지 도달하면 한 사이클 완료</li>
          <li>6. 오차가 허용 범위 이내이거나 최대 반복 횟수 도달 시 종료</li>
        </ol>
      </div>

      {/* Workspace */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>작업 공간 (Workspace)</h4>
        <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          로봇 팔의 엔드이펙터가 도달할 수 있는 모든 점의 집합입니다.
          관절 제한, 링크 길이에 의해 결정됩니다.
          옵션에서 &quot;Workspace Sphere&quot;를 켜면 대략적인 작업 공간을 시각화할 수 있습니다.
        </p>
      </div>

      <div className={`${isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50'} rounded-lg p-4`}>
        <h4 className={`font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-700'} mb-2`}>핵심 관계</h4>
        <ul className={`${isDarkMode ? 'text-purple-200/80' : 'text-purple-700/80'} space-y-1`}>
          <li>- FK: 관절 각도 &rarr; 엔드이펙터 위치 (유일한 해)</li>
          <li>- IK: 엔드이펙터 위치 &rarr; 관절 각도 (다수의 해 가능)</li>
          <li>- DOF 6 = 위치 3 + 방향 3 (완전 자유도)</li>
          <li>- 특이점(Singularity): 관절 축이 정렬될 때 자유도 상실</li>
        </ul>
      </div>
    </div>
  );
}

// Joint descriptions
const jointDescriptions = [
  '베이스 관절. 로봇 전체를 수평면(Y축)에서 회전시킵니다. 작업 반경을 결정합니다.',
  '숄더(어깨) 관절. 상완을 들어올리거나 내립니다. 가장 큰 토크가 필요합니다.',
  '엘보(팔꿈치) 관절. 전완의 굽힘/펼침을 제어합니다. 숄더와 함께 수직 도달 범위를 결정합니다.',
  '손목 1 관절. 엔드이펙터의 방향 제어를 시작합니다. 전완 축 주위로 회전합니다.',
  '손목 2 관절. 엔드이펙터의 기울기(피칭)를 제어합니다.',
  '손목 3 관절. 엔드이펙터의 최종 회전(롤링)을 제어합니다. 도구 방향을 미세 조정합니다.',
];
