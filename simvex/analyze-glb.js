const fs = require('fs');
const buffer = fs.readFileSync('public/models/test/Test_001_glb.glb');
const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);

// GLB Header
const version = dataView.getUint32(4, true);
const length = dataView.getUint32(8, true);

console.log('=== GLB Header ===');
console.log('Version:', version);
console.log('Total Length:', length, 'bytes');

// First chunk (JSON)
const chunk0Length = dataView.getUint32(12, true);
const jsonData = buffer.slice(20, 20 + chunk0Length).toString('utf8');
const gltf = JSON.parse(jsonData);

console.log('\n=== Nodes (Parts) ===');
if (gltf.nodes) {
  gltf.nodes.forEach((node, i) => {
    const hasMesh = node.mesh != null;
    console.log('[' + i + '] ' + (node.name || '(unnamed)') + (hasMesh ? ' (MESH)' : ''));
    if (node.translation) console.log('    position: [' + node.translation.map(v => v.toFixed(3)).join(', ') + ']');
    if (node.children) console.log('    children: [' + node.children.join(', ') + ']');
  });
}

console.log('\n=== Meshes ===');
if (gltf.meshes) {
  gltf.meshes.forEach((mesh, i) => {
    console.log('[' + i + '] ' + (mesh.name || '(unnamed)'));
  });
}

console.log('\n=== Summary ===');
console.log('Total nodes:', gltf.nodes ? gltf.nodes.length : 0);
console.log('Total meshes:', gltf.meshes ? gltf.meshes.length : 0);
console.log('Total materials:', gltf.materials ? gltf.materials.length : 0);
