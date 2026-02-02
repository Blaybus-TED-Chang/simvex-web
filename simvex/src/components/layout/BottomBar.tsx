'use client';

import { useRobotStore } from '@/lib/store/robotStore';

export default function BottomBar() {
  const {
    waypoints,
    currentWaypointIndex,
    isPlaying,
    playbackSpeed,
    loopMode,
    play,
    pause,
    stop,
    goToWaypoint,
    setPlaybackSpeed,
    setLoopMode,
    addWaypoint,
  } = useRobotStore();

  const handlePrevious = () => {
    if (currentWaypointIndex > 0) {
      goToWaypoint(currentWaypointIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentWaypointIndex < waypoints.length - 1) {
      goToWaypoint(currentWaypointIndex + 1);
    }
  };

  const speeds = [0.25, 0.5, 1, 2, 4];

  return (
    <div className="h-16 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4">
      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={waypoints.length === 0 || currentWaypointIndex <= 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Previous"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
          </svg>
        </button>

        {isPlaying ? (
          <button
            onClick={pause}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            title="Pause"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <button
            onClick={play}
            disabled={waypoints.length < 2}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white transition-colors"
            title="Play"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        )}

        <button
          onClick={stop}
          disabled={waypoints.length === 0}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Stop"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={handleNext}
          disabled={waypoints.length === 0 || currentWaypointIndex >= waypoints.length - 1}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Next"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798L4.555 5.168z" />
          </svg>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2" />

        {/* Loop Mode */}
        <select
          value={loopMode}
          onChange={(e) => setLoopMode(e.target.value as 'once' | 'loop' | 'pingpong')}
          className="text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300"
        >
          <option value="once">Once</option>
          <option value="loop">Loop</option>
          <option value="pingpong">Ping-Pong</option>
        </select>

        {/* Speed Control */}
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300"
        >
          {speeds.map(s => (
            <option key={s} value={s}>{s}x</option>
          ))}
        </select>
      </div>

      {/* Waypoint Info */}
      <div className="flex items-center gap-4">
        <button
          onClick={addWaypoint}
          className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Save WP
        </button>

        <span className="text-sm text-gray-600 dark:text-gray-400">
          {waypoints.length > 0
            ? `WP: ${currentWaypointIndex >= 0 ? currentWaypointIndex + 1 : '-'} / ${waypoints.length}`
            : 'No waypoints'}
        </span>
      </div>
    </div>
  );
}
