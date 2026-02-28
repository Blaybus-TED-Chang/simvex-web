import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { UserModelPartConfig } from '@/types/userModel';

// 자동 배정 색상 팔레트
const COLOR_PALETTE = [
  '#4A90D9', '#D94A4A', '#4AD97A', '#D9D04A',
  '#9B4AD9', '#D9884A', '#4AD9D9', '#D94A9B',
  '#7AD94A', '#4A5CD9', '#D96A4A', '#4AD9A8',
  '#B84AD9', '#D9B84A', '#4A8DD9', '#D94A6A',
];

/**
 * GLB Blob에서 메시를 자동 감지하고 분해 설정을 생성
 */
export async function generateExplodeConfig(
  glbBlob: Blob
): Promise<{ parts: UserModelPartConfig[]; meshNames: string[] }> {
  const url = URL.createObjectURL(glbBlob);

  try {
    const loader = new GLTFLoader();
    const gltf = await new Promise<THREE.Group>((resolve, reject) => {
      loader.load(url, (result) => resolve(result.scene), undefined, reject);
    });

    gltf.updateMatrixWorld(true);

    // 모든 메시 수집
    const meshes: { name: string; center: THREE.Vector3; size: number }[] = [];
    const meshNames: string[] = [];

    gltf.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const name = child.name || `mesh_${meshNames.length}`;
        meshNames.push(name);

        const box = new THREE.Box3().setFromObject(child);
        const center = new THREE.Vector3();
        box.getCenter(center);
        const size = box.getSize(new THREE.Vector3()).length();

        meshes.push({ name, center, size });
      }
    });

    if (meshes.length === 0) {
      return { parts: [], meshNames: [] };
    }

    // 모델 전체 중심 계산
    const modelCenter = new THREE.Vector3();
    meshes.forEach((m) => modelCenter.add(m.center));
    modelCenter.divideScalar(meshes.length);

    // 각 메시별 분해 설정 생성
    const parts: UserModelPartConfig[] = meshes.map((mesh, i) => {
      const dir = new THREE.Vector3().subVectors(mesh.center, modelCenter);
      const distance = dir.length();

      // 방향이 0이면 Y축 위로 기본값
      if (distance < 0.001) {
        dir.set(0, 1, 0);
      } else {
        dir.normalize();
      }

      // 분해 거리: 메시~중심 거리에 비례 (최소 0.5)
      const explodeDistance = Math.max(0.5, distance * 1.5);

      return {
        id: `part-${i}`,
        meshName: mesh.name,
        nameKo: mesh.name,
        description: '',
        explodeDirection: [
          parseFloat(dir.x.toFixed(3)),
          parseFloat(dir.y.toFixed(3)),
          parseFloat(dir.z.toFixed(3)),
        ] as [number, number, number],
        explodeDistance: parseFloat(explodeDistance.toFixed(2)),
        color: COLOR_PALETTE[i % COLOR_PALETTE.length],
      };
    });

    return { parts, meshNames };
  } finally {
    URL.revokeObjectURL(url);
  }
}
