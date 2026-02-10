'use client';

export type ViewerTabType = 'viewer' | 'simulation';

interface ViewerTabsProps {
  activeTab: ViewerTabType;
  onTabChange: (tab: ViewerTabType) => void;
  isDarkMode: boolean;
  hasViewer: boolean;
  hasSimulation: boolean;
  simulationName?: string;
}

export function ViewerTabs({
  activeTab,
  onTabChange,
  isDarkMode,
  hasViewer,
  hasSimulation,
  simulationName,
}: ViewerTabsProps) {
  const tabs: { id: ViewerTabType; label: string; enabled: boolean; comingSoon: boolean }[] = [
    {
      id: 'viewer',
      label: '뷰어',
      enabled: hasViewer,
      comingSoon: !hasViewer,
    },
    {
      id: 'simulation',
      label: '시뮬레이터',
      enabled: hasSimulation,
      comingSoon: !hasSimulation,
    },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-lg backdrop-blur-sm" style={{
      backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const isDisabled = !tab.enabled;

        return (
          <button
            key={tab.id}
            onClick={() => {
              if (!isDisabled) onTabChange(tab.id);
            }}
            disabled={isDisabled}
            className={`
              relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${isActive
                ? isDarkMode
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                : isDisabled
                  ? isDarkMode
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                  : isDarkMode
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            {tab.label}
            {tab.comingSoon && (
              <span className={`ml-1.5 text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                (준비 중)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
