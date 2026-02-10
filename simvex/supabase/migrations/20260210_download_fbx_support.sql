-- user_models에 FBX 원본 경로 컬럼 추가
ALTER TABLE user_models ADD COLUMN original_fbx_storage_path TEXT;

-- Storage 버킷 MIME 타입 업데이트 (application/octet-stream으로 FBX 허용)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'model/gltf-binary',
  'application/octet-stream',
  'image/png',
  'image/jpeg'   
]
WHERE id = 'user-models';
