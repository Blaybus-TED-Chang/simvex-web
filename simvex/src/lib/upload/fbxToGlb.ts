import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

/**
 * FBX 파일(ArrayBuffer)을 GLB Blob으로 변환
 * - 텍스처 제거, MeshStandardMaterial(색상만) 적용 (프로젝트 컨벤션)
 */
export async function convertFbxToGlb(fbxBuffer: ArrayBuffer): Promise<Blob> {
  const loader = new FBXLoader();
  const scene = loader.parse(fbxBuffer, '');

  // 텍스처 제거, 색상만 유지하는 MeshStandardMaterial로 교체
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      const oldMat = child.material as THREE.MeshStandardMaterial;
      const color = oldMat?.color ? oldMat.color.clone() : new THREE.Color('#888888');
      child.material = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.3,
        roughness: 0.6,
      });
    }
  });

  const exporter = new GLTFExporter();
  const glb = await exporter.parseAsync(scene, { binary: true });
  return new Blob([glb as ArrayBuffer], { type: 'model/gltf-binary' });
}
