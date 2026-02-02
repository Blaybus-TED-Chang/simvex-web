'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJetEngineStore } from '@/lib/store/jetEngineStore';

interface JetEngineModelProps {
  cutaway?: boolean;
}

export default function JetEngineModel({ cutaway = true }: JetEngineModelProps) {
  const { params, output, selectedSection, setSelectedSection } = useJetEngineStore();
  const fanRef = useRef<THREE.Group>(null);
  const lpcRef = useRef<THREE.Group>(null);
  const hpcRef = useRef<THREE.Group>(null);
  const hptRef = useRef<THREE.Group>(null);
  const lptRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const n1Speed = (output.n1 / 100) * 0.5;
    const n2Speed = (output.n2 / 100) * 0.8;

    if (fanRef.current) fanRef.current.rotation.y += n1Speed * delta * 10;
    if (lpcRef.current) lpcRef.current.rotation.y += n1Speed * delta * 10;
    if (hpcRef.current) hpcRef.current.rotation.y += n2Speed * delta * 15;
    if (hptRef.current) hptRef.current.rotation.y += n2Speed * delta * 15;
    if (lptRef.current) lptRef.current.rotation.y += n1Speed * delta * 10;
  });

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(selectedSection === sectionId ? null : sectionId);
  };

  const engineLength = 4;
  const maxRadius = 1.2;

  return (
    <group rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      {/* Nacelle (outer casing) */}
      <mesh castShadow>
        <cylinderGeometry args={[maxRadius, maxRadius * 1.1, engineLength, 64, 1, !cutaway, 0, cutaway ? Math.PI : Math.PI * 2]} />
        <meshStandardMaterial
          color="#404854"
          metalness={0.85}
          roughness={0.25}
          side={THREE.DoubleSide}
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Inlet - open ended */}
      <group position={[0, engineLength / 2 + 0.2, 0]}>
        <mesh castShadow onClick={() => handleSectionClick('inlet')}>
          <cylinderGeometry args={[maxRadius * 1.05, maxRadius, 0.4, 64, 1, true]} />
          <meshStandardMaterial
            color={selectedSection === 'inlet' ? '#60A5FA' : '#505864'}
            metalness={0.8}
            roughness={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inlet lip ring */}
        <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[maxRadius * 1.05, 0.04, 16, 64]} />
          <meshStandardMaterial color="#A0A8B4" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Fan Section */}
      <group position={[0, engineLength / 2 - 0.3, 0]}>
        <group ref={fanRef}>
          <RealisticFanBlades
            radius={maxRadius * 0.9}
            bladeCount={22}
            selected={selectedSection === 'fan'}
            onClick={() => handleSectionClick('fan')}
          />
        </group>
        {/* Spinner cone */}
        <Spinner />
      </group>

      {/* LPC - Low Pressure Compressor */}
      <group position={[0, engineLength / 2 - 1, 0]} ref={lpcRef}>
        <RealisticCompressor
          innerRadius={0.25}
          outerRadius={0.6}
          stageCount={3}
          bladeCount={32}
          selected={selectedSection === 'lpc'}
          onClick={() => handleSectionClick('lpc')}
          color="#22D3EE"
        />
      </group>

      {/* Core Casing */}
      {cutaway && (
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.65, 0.65, 2.5, 64, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#6B7280" metalness={0.7} roughness={0.35} side={THREE.DoubleSide} transparent opacity={0.45} />
        </mesh>
      )}

      {/* HPC - High Pressure Compressor */}
      <group position={[0, 0, 0]} ref={hpcRef}>
        <RealisticCompressor
          innerRadius={0.2}
          outerRadius={0.55}
          stageCount={6}
          bladeCount={40}
          selected={selectedSection === 'hpc'}
          onClick={() => handleSectionClick('hpc')}
          color="#818CF8"
        />
      </group>

      {/* Combustor */}
      <group position={[0, -0.7, 0]}>
        <Combustor
          selected={selectedSection === 'combustor'}
          onClick={() => handleSectionClick('combustor')}
          throttle={params.throttle}
        />
      </group>

      {/* HPT - High Pressure Turbine */}
      <group position={[0, -1.2, 0]} ref={hptRef}>
        <RealisticTurbine
          innerRadius={0.2}
          outerRadius={0.5}
          stageCount={2}
          bladeCount={48}
          selected={selectedSection === 'hpt'}
          onClick={() => handleSectionClick('hpt')}
          color="#EF4444"
          hot
        />
      </group>

      {/* LPT - Low Pressure Turbine */}
      <group position={[0, -1.6, 0]} ref={lptRef}>
        <RealisticTurbine
          innerRadius={0.25}
          outerRadius={0.55}
          stageCount={4}
          bladeCount={56}
          selected={selectedSection === 'lpt'}
          onClick={() => handleSectionClick('lpt')}
          color="#F59E0B"
          hot={false}
        />
      </group>

      {/* Nozzle */}
      <group position={[0, -engineLength / 2 - 0.1, 0]}>
        <mesh castShadow onClick={() => handleSectionClick('nozzle')}>
          <cylinderGeometry args={[0.5, 0.65, 0.5, 64]} />
          <meshStandardMaterial
            color={selectedSection === 'nozzle' ? '#EC4899' : '#404854'}
            metalness={0.85}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.45, 0.5, 0.1, 64]} />
          <meshBasicMaterial
            color={new THREE.Color().setHSL(0.05, 1, 0.3 + (params.throttle / 100) * 0.4)}
            transparent
            opacity={0.3 + (params.throttle / 100) * 0.5}
          />
        </mesh>
      </group>

      {/* Bypass Duct */}
      {cutaway && (
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 2, 64, 1, true, 0, Math.PI]} />
          <meshStandardMaterial color="#505864" metalness={0.6} roughness={0.4} side={THREE.DoubleSide} transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}

// Realistic 3D fan blade with airfoil cross-section, twist, taper, and sweep
function RealisticFanBlades({
  radius,
  bladeCount,
  selected,
  onClick,
}: {
  radius: number;
  bladeCount: number;
  selected: boolean;
  onClick: () => void;
}) {
  // Create a single blade geometry with proper aerodynamic shape
  const bladeGeometry = useMemo(() => {
    const innerRadius = 0.28;
    const outerRadius = radius * 0.95;
    const bladeSpan = outerRadius - innerRadius;

    // Number of spanwise sections and chordwise points
    const spanSections = 12;
    const chordPoints = 16;

    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // Generate NACA-like airfoil points
    function getAirfoilPoint(chordPos: number, thickness: number, camber: number): { upper: number; lower: number } {
      // Simplified NACA 4-digit airfoil formula
      const t = thickness;
      const m = camber;
      const p = 0.4; // Max camber position

      // Thickness distribution
      const yt = (t / 0.2) * (0.2969 * Math.sqrt(chordPos) - 0.126 * chordPos - 0.3516 * chordPos ** 2 + 0.2843 * chordPos ** 3 - 0.1015 * chordPos ** 4);

      // Camber line
      let yc = 0;
      if (chordPos < p) {
        yc = (m / (p * p)) * (2 * p * chordPos - chordPos * chordPos);
      } else {
        yc = (m / ((1 - p) ** 2)) * ((1 - 2 * p) + 2 * p * chordPos - chordPos * chordPos);
      }

      return {
        upper: yc + yt,
        lower: yc - yt,
      };
    }

    // Generate blade surface
    for (let i = 0; i <= spanSections; i++) {
      const spanT = i / spanSections; // 0 = hub, 1 = tip
      const r = innerRadius + spanT * bladeSpan;

      // Blade parameters vary along span
      const twist = THREE.MathUtils.lerp(Math.PI / 3, Math.PI / 9, spanT); // 60° to 20° twist
      const chord = THREE.MathUtils.lerp(0.18, 0.08, spanT); // Taper: wider at hub
      const thickness = THREE.MathUtils.lerp(0.12, 0.04, spanT); // Thicker at hub
      const camber = THREE.MathUtils.lerp(0.04, 0.02, spanT); // More camber at hub
      const sweep = spanT * spanT * 0.08; // Quadratic sweep toward tip

      // Generate airfoil cross-section at this span location
      for (let j = 0; j <= chordPoints; j++) {
        const chordT = j / chordPoints;
        const chordPos = chordT;

        const airfoil = getAirfoilPoint(chordPos, thickness, camber);

        // Upper surface point
        const upperX = (chordPos - 0.25) * chord; // Offset so rotation is around quarter chord
        const upperY = airfoil.upper * chord;

        // Apply twist rotation
        const cosT = Math.cos(twist);
        const sinT = Math.sin(twist);
        const rotatedUpperX = upperX * cosT - upperY * sinT;
        const rotatedUpperY = upperX * sinT + upperY * cosT;

        // Final position with sweep
        vertices.push(
          r, // radial position
          rotatedUpperY, // height (Y in engine coords)
          rotatedUpperX + sweep // chord direction with sweep
        );

        uvs.push(chordT, spanT);
      }

      // Lower surface (reverse order for proper winding)
      for (let j = chordPoints; j >= 0; j--) {
        const chordT = j / chordPoints;
        const chordPos = chordT;

        const airfoil = getAirfoilPoint(chordPos, thickness, camber);

        const lowerX = (chordPos - 0.25) * chord;
        const lowerY = airfoil.lower * chord;

        const cosT = Math.cos(twist);
        const sinT = Math.sin(twist);
        const rotatedLowerX = lowerX * cosT - lowerY * sinT;
        const rotatedLowerY = lowerX * sinT + lowerY * cosT;

        vertices.push(
          r,
          rotatedLowerY,
          rotatedLowerX + sweep
        );

        uvs.push(chordT, spanT);
      }
    }

    // Generate indices for triangles
    const vertsPerSection = (chordPoints + 1) * 2;

    for (let i = 0; i < spanSections; i++) {
      for (let j = 0; j < vertsPerSection - 1; j++) {
        const current = i * vertsPerSection + j;
        const next = current + vertsPerSection;

        indices.push(current, next, current + 1);
        indices.push(current + 1, next, next + 1);
      }
      // Connect last to first in each section (close the airfoil)
      const lastInSection = i * vertsPerSection + vertsPerSection - 1;
      const firstInSection = i * vertsPerSection;
      const nextLastInSection = (i + 1) * vertsPerSection + vertsPerSection - 1;
      const nextFirstInSection = (i + 1) * vertsPerSection;

      indices.push(lastInSection, nextLastInSection, firstInSection);
      indices.push(firstInSection, nextLastInSection, nextFirstInSection);
    }

    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }, [radius]);

  const blades = useMemo(() => {
    const items = [];

    for (let i = 0; i < bladeCount; i++) {
      const angle = (i / bladeCount) * Math.PI * 2;

      items.push(
        <mesh
          key={i}
          geometry={bladeGeometry}
          rotation={[0, angle, 0]}
          onClick={onClick}
          castShadow
        >
          <meshStandardMaterial
            color={selected ? '#4ADE80' : '#E0E4E8'}
            metalness={0.85}
            roughness={0.18}
            side={THREE.DoubleSide}
          />
        </mesh>
      );
    }
    return items;
  }, [bladeCount, bladeGeometry, selected, onClick]);

  return <group>{blades}</group>;
}

// Spinner cone
function Spinner() {
  return (
    <group>
      {/* Main cone */}
      <mesh castShadow>
        <coneGeometry args={[0.28, 0.7, 64]} />
        <meshStandardMaterial
          color="#2D3748"
          metalness={0.95}
          roughness={0.1}
        />
      </mesh>
      {/* Spinner tip highlight */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#E0E4E8" metalness={0.98} roughness={0.05} />
      </mesh>
      {/* Spinner base disk */}
      <mesh position={[0, -0.32, 0]}>
        <cylinderGeometry args={[0.3, 0.28, 0.05, 64]} />
        <meshStandardMaterial color="#4A5568" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Realistic compressor with individual blades
function RealisticCompressor({
  innerRadius,
  outerRadius,
  stageCount,
  bladeCount,
  selected,
  onClick,
  color,
}: {
  innerRadius: number;
  outerRadius: number;
  stageCount: number;
  bladeCount: number;
  selected: boolean;
  onClick: () => void;
  color: string;
}) {
  const stages = useMemo(() => {
    const items = [];

    for (let s = 0; s < stageCount; s++) {
      const stageRadius = outerRadius - s * 0.015;
      const stageY = s * 0.1;
      const stageBladesCount = bladeCount - s * 2;

      // Rotor disk
      items.push(
        <mesh key={`disk-${s}`} position={[0, stageY, 0]} onClick={onClick}>
          <cylinderGeometry args={[stageRadius * 0.95, stageRadius, 0.015, 64]} />
          <meshStandardMaterial
            color={selected ? color : '#8892A0'}
            metalness={0.85}
            roughness={0.2}
          />
        </mesh>
      );

      // Individual blades
      for (let i = 0; i < stageBladesCount; i++) {
        const angle = (i / stageBladesCount) * Math.PI * 2;
        const bladeLength = stageRadius - innerRadius - s * 0.01;
        const bladeHeight = 0.04 - s * 0.003;

        items.push(
          <mesh
            key={`blade-${s}-${i}`}
            position={[
              Math.cos(angle) * (innerRadius + bladeLength / 2 + s * 0.005),
              stageY,
              Math.sin(angle) * (innerRadius + bladeLength / 2 + s * 0.005),
            ]}
            rotation={[0, -angle, Math.PI / 12]}
            onClick={onClick}
          >
            <boxGeometry args={[bladeLength, bladeHeight, 0.006]} />
            <meshStandardMaterial
              color={selected ? color : '#C0C8D0'}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
        );
      }
    }

    return items;
  }, [innerRadius, outerRadius, stageCount, bladeCount, selected, onClick, color]);

  return <group>{stages}</group>;
}

// Realistic turbine with hot glow
function RealisticTurbine({
  innerRadius,
  outerRadius,
  stageCount,
  bladeCount,
  selected,
  onClick,
  color,
  hot,
}: {
  innerRadius: number;
  outerRadius: number;
  stageCount: number;
  bladeCount: number;
  selected: boolean;
  onClick: () => void;
  color: string;
  hot: boolean;
}) {
  const { params } = useJetEngineStore();
  const throttle = params.throttle / 100;

  const stages = useMemo(() => {
    const items = [];

    for (let s = 0; s < stageCount; s++) {
      const stageY = -s * 0.08;
      const stageBladesCount = bladeCount - s * 4;

      // Turbine disk
      items.push(
        <mesh key={`disk-${s}`} position={[0, stageY, 0]} onClick={onClick}>
          <cylinderGeometry args={[outerRadius, outerRadius * 0.98, 0.012, 64]} />
          <meshStandardMaterial
            color={selected ? color : '#706860'}
            metalness={0.8}
            roughness={0.25}
            emissive={hot ? '#FF4400' : '#FF8800'}
            emissiveIntensity={hot ? throttle * 0.3 : throttle * 0.15}
          />
        </mesh>
      );

      // Turbine blades - curved shape
      for (let i = 0; i < stageBladesCount; i++) {
        const angle = (i / stageBladesCount) * Math.PI * 2;
        const bladeLength = outerRadius - innerRadius;

        items.push(
          <mesh
            key={`blade-${s}-${i}`}
            position={[
              Math.cos(angle) * (innerRadius + bladeLength / 2),
              stageY,
              Math.sin(angle) * (innerRadius + bladeLength / 2),
            ]}
            rotation={[0, -angle, -Math.PI / 10]}
            onClick={onClick}
          >
            <boxGeometry args={[bladeLength, 0.035, 0.005]} />
            <meshStandardMaterial
              color={selected ? color : '#887870'}
              metalness={0.85}
              roughness={0.2}
              emissive={hot ? '#FF2200' : '#FF6600'}
              emissiveIntensity={hot ? throttle * 0.4 : throttle * 0.2}
            />
          </mesh>
        );
      }
    }

    return items;
  }, [innerRadius, outerRadius, stageCount, bladeCount, selected, onClick, color, hot, throttle]);

  return <group>{stages}</group>;
}

// Combustor
function Combustor({
  selected,
  onClick,
  throttle,
}: {
  selected: boolean;
  onClick: () => void;
  throttle: number;
}) {
  const flameIntensity = throttle / 100;

  return (
    <group onClick={onClick}>
      {/* Combustor liner with holes */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.5, 0.5, 64]} />
        <meshStandardMaterial
          color={selected ? '#F97316' : '#58524C'}
          metalness={0.6}
          roughness={0.4}
          emissive="#FF4400"
          emissiveIntensity={flameIntensity * 0.3}
        />
      </mesh>

      {/* Flame glow */}
      <pointLight
        position={[0, 0, 0]}
        intensity={flameIntensity * 3}
        color="#ff4400"
        distance={1.5}
        decay={2}
      />

      {/* Inner flame */}
      <mesh>
        <cylinderGeometry args={[0.35, 0.4, 0.4, 64]} />
        <meshBasicMaterial
          color={new THREE.Color().setHSL(0.08 - flameIntensity * 0.05, 1, 0.5 + flameIntensity * 0.2)}
          transparent
          opacity={0.4 + flameIntensity * 0.4}
        />
      </mesh>

      {/* Fuel nozzles */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.35, 0.15, Math.sin(angle) * 0.35]}>
            <cylinderGeometry args={[0.015, 0.02, 0.1, 8]} />
            <meshStandardMaterial color="#404040" metalness={0.9} roughness={0.3} />
          </mesh>
        );
      })}
    </group>
  );
}
