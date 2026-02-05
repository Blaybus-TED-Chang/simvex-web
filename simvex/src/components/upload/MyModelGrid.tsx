'use client';

import Link from 'next/link';
import type { UserModelRow } from '@/types/userModel';
import { getPublicUrl } from '@/hooks/useUserModels';

interface MyModelGridProps {
  models: UserModelRow[];
  loading: boolean;
  isDarkMode: boolean;
  onEdit: (model: UserModelRow) => void;
  onDelete: (model: UserModelRow) => void;
  onTogglePublic: (id: string, isPublic: boolean) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MyModelGrid({
  models,
  loading,
  isDarkMode,
  onEdit,
  onDelete,
  onTogglePublic,
}: MyModelGridProps) {
  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-48 rounded-xl animate-pulse ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}
          />
        ))}
      </div>
    );
  }

  if (models.length === 0) {
    return (
      <div className={`text-center py-12 rounded-xl border-2 border-dashed ${
        isDarkMode ? 'border-gray-800 text-gray-600' : 'border-gray-200 text-gray-400'
      }`}>
        <p className="text-lg mb-1">업로드된 모델이 없습니다</p>
        <p className="text-sm">아래에서 3D 모델을 업로드해보세요</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {models.map((model) => {
        const thumbnailUrl = model.thumbnail_storage_path
          ? getPublicUrl(model.thumbnail_storage_path)
          : null;

        return (
          <div
            key={model.id}
            className={`relative rounded-xl border overflow-hidden ${
              isDarkMode
                ? 'border-gray-800 bg-gray-900'
                : 'border-gray-200 bg-white shadow-sm'
            }`}
          >
            {/* 썸네일 */}
            <Link href={`/viewer/u-${model.id}`}>
              <div className={`aspect-video flex items-center justify-center ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
              }`}>
                {thumbnailUrl ? (
                  <img src={thumbnailUrl} alt={model.name} className="w-full h-full object-cover" />
                ) : (
                  <svg className={`w-12 h-12 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                  </svg>
                )}
              </div>
            </Link>

            {/* 정보 */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {model.name}
                </h4>
                <span className={`px-1.5 py-0.5 text-xs rounded flex-shrink-0 ${
                  isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  {model.category}
                </span>
              </div>

              <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {(model.parts_config as unknown[]).length}개 부품 &middot; {formatBytes(model.file_size_bytes)}
              </p>

              {/* 액션 버튼 */}
              <div className="flex items-center gap-2">
                {/* 공개 토글 */}
                <button
                  onClick={() => onTogglePublic(model.id, !model.is_public)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    model.is_public
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : isDarkMode
                        ? 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {model.is_public ? '공개' : '비공개'}
                </button>

                <button
                  onClick={() => onEdit(model)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    isDarkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  수정
                </button>

                <button
                  onClick={() => {
                    if (confirm('정말 삭제하시겠습니까?')) onDelete(model);
                  }}
                  className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
