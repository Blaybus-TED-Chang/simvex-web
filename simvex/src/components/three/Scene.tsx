'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { useRobotStore } from '@/lib/store/robotStore';
import RobotArm from './RobotArm';
import TargetMarker from './TargetMarker';
import WorkspaceVisualizer from './WorkspaceVisualizer';
import TrajectoryLine from './TrajectoryLine';
import PlaybackController from './PlaybackController';

interface SceneProps {
  isDarkMode?: boolean;
}

export default function Scene({ isDarkMode = true }: SceneProps) {
  const { mode, showWorkspace, showTrajectory } = useRobotStore();

  return (
    <Canvas
      camera={{ position: [2, 2, 2], fov: 50 }}
      shadows
      style={{ background: isDarkMode ? '#0f172a' : '#f8fafc' }}
    >
      {/* Lighting */}
      <ambientLight intensity={isDarkMode ? 0.5 : 0.7} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={isDarkMode ? 1 : 1.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, 5, -5]} intensity={isDarkMode ? 0.3 : 0.5} />

      {/* Environment */}
      <Grid
        args={[10, 10]}
        cellSize={0.2}
        cellThickness={0.5}
        cellColor={isDarkMode ? '#334155' : '#cbd5e1'}
        sectionSize={1}
        sectionThickness={1}
        sectionColor={isDarkMode ? '#475569' : '#94a3b8'}
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {/* Axes Helper */}
      <axesHelper args={[0.5]} />

      {/* Robot Arm */}
      <RobotArm />

      {/* Target Marker (IK Mode) */}
      {mode === 'ik' && <TargetMarker />}

      {/* Workspace Visualization */}
      {showWorkspace && <WorkspaceVisualizer />}

      {/* Trajectory Line */}
      {showTrajectory && <TrajectoryLine />}

      {/* Playback Controller */}
      <PlaybackController />

      {/* Controls */}
      <OrbitControls
        makeDefault
        minDistance={1}
        maxDistance={10}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.1}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Gizmo */}
      <GizmoHelper alignment="top-right" margin={[72, 72]}>
        <GizmoViewport
          axisColors={['#ef4444', '#22c55e', '#3b82f6']}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  );
}
