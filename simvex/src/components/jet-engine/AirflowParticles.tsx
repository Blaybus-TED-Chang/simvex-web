'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useJetEngineStore } from '@/lib/store/jetEngineStore';

const STREAMLINE_COUNT = 48;
const STREAMLINE_SEGMENTS = 60;

export default function AirflowParticles() {
  const { airflowMode, showParticles } = useJetEngineStore();

  if (!showParticles) return null;

  const showParticleMode = airflowMode === 'particles' || airflowMode === 'both';
  const showStreamlines = airflowMode === 'streamlines' || airflowMode === 'both';

  return (
    <group>
      {showParticleMode && <FlowParticles />}
      {showStreamlines && <Streamlines />}
      <ExhaustPlume />
    </group>
  );
}

// Subtle flow particles
function FlowParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const { params, output } = useJetEngineStore();
  const particleCount = 300;

  const particleData = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      initParticle(i, positions, colors, Math.random());
    }

    return { positions, colors };
  }, []);

  function initParticle(i: number, positions: Float32Array, colors: Float32Array, phase: number) {
    const i3 = i * 3;
    const isBypass = Math.random() > 0.4;
    const radius = isBypass ? 0.75 + Math.random() * 0.35 : 0.1 + Math.random() * 0.4;
    const angle = Math.random() * Math.PI * 2;

    positions[i3] = Math.cos(angle) * radius;
    positions[i3 + 1] = Math.sin(angle) * radius;
    positions[i3 + 2] = 3.5 - phase * 8;

    if (isBypass) {
      colors[i3] = 0.4;
      colors[i3 + 1] = 0.7;
      colors[i3 + 2] = 1.0;
    } else {
      colors[i3] = 1.0;
      colors[i3 + 1] = 0.5;
      colors[i3 + 2] = 0.2;
    }
  }

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(particleData.colors, 3));
    return geo;
  }, [particleData]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const colAttr = pointsRef.current.geometry.getAttribute('color') as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;
    const col = colAttr.array as Float32Array;

    const speed = (output.n1 / 100) * 4 + 1;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      pos[i3 + 2] -= speed * delta;

      if (pos[i3 + 2] < -4.5) {
        initParticle(i, pos, col, 0);
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Smooth streamlines
function Streamlines() {
  const groupRef = useRef<THREE.Group>(null);
  const { params, output } = useJetEngineStore();
  const timeRef = useRef(0);

  const streamDataRef = useRef<{ radius: number; angle: number; isBypass: boolean; offset: number }[]>([]);
  if (streamDataRef.current.length === 0) {
    // Bypass streamlines (blue, outer)
    for (let i = 0; i < 32; i++) {
      const layer = Math.floor(i / 8);
      streamDataRef.current.push({
        radius: 0.72 + layer * 0.08,
        angle: (i / 8) * Math.PI * 2 + layer * 0.2,
        isBypass: true,
        offset: Math.random() * Math.PI * 2,
      });
    }
    // Core streamlines (orange, inner)
    for (let i = 0; i < 16; i++) {
      const layer = Math.floor(i / 8);
      streamDataRef.current.push({
        radius: 0.2 + layer * 0.15,
        angle: (i / 8) * Math.PI * 2 + layer * 0.3,
        isBypass: false,
        offset: Math.random() * Math.PI * 2,
      });
    }
  }
  const streamData = streamDataRef.current;

  useFrame((_, delta) => {
    timeRef.current += delta * (0.3 + (output.n1 / 100) * 1.2);

    if (groupRef.current) {
      groupRef.current.children.forEach((child, idx) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.time.value = timeRef.current + (streamData[idx]?.offset || 0);
          child.material.uniforms.throttle.value = params.throttle / 100;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {streamData.map((data, i) => (
        <StreamRibbon key={i} data={data} />
      ))}
    </group>
  );
}

function StreamRibbon({ data }: { data: { radius: number; angle: number; isBypass: boolean; offset: number } }) {
  const geometry = useMemo(() => {
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const width = data.isBypass ? 0.035 : 0.025;

    for (let i = 0; i <= STREAMLINE_SEGMENTS; i++) {
      const t = i / STREAMLINE_SEGMENTS;
      const z = 3.5 - t * 8;

      let r = data.radius;
      if (!data.isBypass) {
        if (z < 1.5 && z > 0) r *= 1 - (1.5 - z) / 1.5 * 0.3;
        if (z < 0 && z > -2) r *= 0.7 + (-z / 2) * 0.35;
      }

      const x = Math.cos(data.angle) * r;
      const y = Math.sin(data.angle) * r;
      const w = width * (1 - t * 0.5);

      const nx = -Math.sin(data.angle) * w;
      const ny = Math.cos(data.angle) * w;

      vertices.push(x - nx, y - ny, z, x + nx, y + ny, z);
      uvs.push(0, t, 1, t);

      if (i < STREAMLINE_SEGMENTS) {
        const b = i * 2;
        indices.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }, [data]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        throttle: { value: 0.5 },
        isBypass: { value: data.isBypass ? 1.0 : 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float throttle;
        uniform float isBypass;
        varying vec2 vUv;

        void main() {
          float t = vUv.y;
          float flow = fract(t * 3.0 - time * 0.6);
          float pulse = smoothstep(0.0, 0.35, flow) * smoothstep(1.0, 0.65, flow);

          vec3 blue = vec3(0.35, 0.7, 1.0);
          vec3 lightBlue = vec3(0.6, 0.88, 1.0);
          vec3 orange = vec3(1.0, 0.6, 0.15);
          vec3 red = vec3(1.0, 0.3, 0.1);

          vec3 color;
          if (isBypass > 0.5) {
            color = mix(blue, lightBlue, pulse * 0.6);
          } else {
            color = t < 0.4 ? mix(blue, orange, t / 0.4) : mix(orange, red, (t - 0.4) / 0.6 * throttle);
          }

          float edge = 1.0 - pow(abs(vUv.x - 0.5) * 2.0, 2.0);
          float fadeIn = smoothstep(0.0, 0.02, t);
          float fadeOut = smoothstep(1.0, 0.88, t);
          float alpha = edge * fadeIn * fadeOut * (0.55 + pulse * 0.45);

          gl_FragColor = vec4(color * 1.15, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, [data.isBypass]);

  return <mesh geometry={geometry} material={material} />;
}

// Beautiful exhaust plume like reference image
function ExhaustPlume() {
  const { params } = useJetEngineStore();
  const timeRef = useRef(0);
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const segments = 64;
    const rings = 40;
    const vertices: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= rings; i++) {
      const t = i / rings;
      const z = -2.2 - t * 3.5;

      // Plume shape: narrow at nozzle, expands, then tapers
      let radius;
      if (t < 0.15) {
        radius = 0.38 + t * 1.2;
      } else if (t < 0.5) {
        radius = 0.56 + (t - 0.15) * 0.4;
      } else {
        radius = 0.7 - (t - 0.5) * 1.0;
      }
      radius = Math.max(0.05, radius);

      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        vertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
        uvs.push(j / segments, t);
      }
    }

    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j;
        const b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    return geo;
  }, []);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        throttle: { value: 0.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float time;
        uniform float throttle;

        void main() {
          vUv = uv;
          vec3 pos = position;

          // Subtle turbulence
          float turb = sin(pos.z * 6.0 + time * 12.0) * 0.015 * throttle;
          turb += sin(pos.z * 10.0 - time * 18.0) * 0.01 * throttle;
          pos.x += turb * cos(uv.x * 6.28318);
          pos.y += turb * sin(uv.x * 6.28318);

          // Scale with throttle
          float scale = 0.15 + throttle * 0.85;
          pos.xy *= scale;
          pos.z = -2.2 + (position.z + 2.2) * scale;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float throttle;
        varying vec2 vUv;

        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
          float t = vUv.y;

          // Smooth gradient colors like reference
          vec3 white = vec3(1.0, 0.98, 0.92);
          vec3 brightYellow = vec3(1.0, 0.92, 0.6);
          vec3 orange = vec3(1.0, 0.6, 0.2);
          vec3 deepOrange = vec3(0.95, 0.4, 0.1);

          vec3 color;
          if (t < 0.1) {
            color = mix(white, brightYellow, t / 0.1);
          } else if (t < 0.35) {
            color = mix(brightYellow, orange, (t - 0.1) / 0.25);
          } else if (t < 0.65) {
            color = mix(orange, deepOrange, (t - 0.35) / 0.3);
          } else {
            color = deepOrange * (1.0 - (t - 0.65) / 0.35 * 0.5);
          }

          // Subtle noise for realism
          float n = noise(vUv * 12.0 + time * 4.0) * 0.08;
          color += n;

          // Smooth alpha falloff
          float centerDist = abs(vUv.x - 0.5) * 2.0;
          float coreBrightness = 1.0 - pow(centerDist, 1.5) * 0.4;

          float fadeStart = smoothstep(0.0, 0.05, t);
          float fadeEnd = 1.0 - smoothstep(0.5, 1.0, t);

          float alpha = coreBrightness * fadeStart * fadeEnd * throttle;
          alpha *= 0.85;

          // Boost core brightness
          if (t < 0.15) {
            color *= 1.2;
          }

          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }, []);

  useFrame((_, delta) => {
    timeRef.current += delta;
    if (meshRef.current?.material instanceof THREE.ShaderMaterial) {
      meshRef.current.material.uniforms.time.value = timeRef.current;
      meshRef.current.material.uniforms.throttle.value = params.throttle / 100;
    }
  });

  const throttle = params.throttle / 100;

  return (
    <group>
      <mesh ref={meshRef} geometry={geometry} material={material} />

      {/* Core glow */}
      <mesh position={[0, 0, -2.4]}>
        <circleGeometry args={[0.32 * throttle, 32]} />
        <meshBasicMaterial
          color="#fffaf0"
          transparent
          opacity={throttle * 0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Lights */}
      <pointLight position={[0, 0, -2.5]} color="#ffaa55" intensity={throttle * 3} distance={5} decay={2} />
      <pointLight position={[0, 0, -3.5]} color="#ff7733" intensity={throttle * 1.5} distance={3} decay={2} />
    </group>
  );
}
