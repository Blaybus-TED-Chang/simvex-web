'use client';

import dynamic from 'next/dynamic';
import { getSimulationMapping } from '@/data/simulationMapping';

const DroneSimContent = dynamic(() => import('@/components/simulation/DroneSimContent'), { ssr: false });
const RobotArmSimContent = dynamic(() => import('@/components/simulation/RobotArmSimContent'), { ssr: false });
const JetEngineSimContent = dynamic(() => import('@/components/simulation/JetEngineSimContent'), { ssr: false });
const ComingSoonPanel = dynamic(() => import('@/components/simulation/ComingSoonPanel'), { ssr: false });

interface SimulationTabContentProps {
  modelId: string;
  isDarkMode: boolean;
  showLearning: boolean;
  onCloseLearning: () => void;
}

export function SimulationTabContent({ modelId, isDarkMode, showLearning, onCloseLearning }: SimulationTabContentProps) {
  const mapping = getSimulationMapping(modelId);

  if (!mapping) {
    return <ComingSoonPanel isDarkMode={isDarkMode} />;
  }

  switch (mapping.simulationId) {
    case 'drone':
      return <DroneSimContent isDarkMode={isDarkMode} showLearning={showLearning} onCloseLearning={onCloseLearning} />;
    case 'robot-arm':
      return <RobotArmSimContent isDarkMode={isDarkMode} showLearning={showLearning} onCloseLearning={onCloseLearning} />;
    case 'jet-engine':
      return <JetEngineSimContent isDarkMode={isDarkMode} showLearning={showLearning} onCloseLearning={onCloseLearning} />;
    default:
      return <ComingSoonPanel isDarkMode={isDarkMode} />;
  }
}
