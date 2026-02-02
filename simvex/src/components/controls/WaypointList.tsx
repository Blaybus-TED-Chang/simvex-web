'use client';

import { useRobotStore } from '@/lib/store/robotStore';

export default function WaypointList() {
  const {
    waypoints,
    currentWaypointIndex,
    goToWaypoint,
    removeWaypoint,
    clearWaypoints,
  } = useRobotStore();

  if (waypoints.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No waypoints saved yet.
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Use the &quot;Save WP&quot; button to record positions.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Waypoints ({waypoints.length})
        </h3>
        <button
          onClick={() => {
            if (confirm('Clear all waypoints?')) {
              clearWaypoints();
            }
          }}
          className="text-xs text-red-500 hover:underline"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {waypoints.map((wp, index) => (
          <div
            key={wp.id}
            className={`flex items-center justify-between p-2 rounded-lg ${
              currentWaypointIndex === index
                ? 'bg-blue-100 dark:bg-blue-900/30'
                : 'bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-5">
                {index + 1}.
              </span>
              <div>
                <span className="text-sm text-gray-900 dark:text-white">{wp.name}</span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  ({wp.position.x.toFixed(2)}, {wp.position.y.toFixed(2)}, {wp.position.z.toFixed(2)})
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => goToWaypoint(index)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Go to"
              >
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={() => removeWaypoint(wp.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                title="Delete"
              >
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
