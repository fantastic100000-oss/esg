import { useState } from 'react';
import { FileMetadataForm } from './FileMetadataForm';
import { formatBytes, formatDate } from '../../lib/format';
import type { FileMetadata } from '../../types';

interface FileListProps {
  folderId: string | null;
  files: FileMetadata[];
  onCreate: (data: Omit<FileMetadata, 'id' | 'folderId'>) => void;
  onUpdate: (file: FileMetadata) => void;
  onDelete: (fileId: string) => void;
}

export function FileList({ folderId, files, onCreate, onUpdate, onDelete }: FileListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<FileMetadata | undefined>(undefined);

  if (!folderId) {
    return <p className="py-12 text-center text-sm text-slate-400">좌측에서 폴더를 선택하세요.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + 파일 업로드
        </button>
      </div>

      {files.length === 0 && <p className="py-8 text-center text-sm text-slate-400">이 폴더에 파일이 없습니다.</p>}

      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  📄 {file.fileName}
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{file.documentType}</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {file.extension.toUpperCase()} · {formatBytes(file.sizeBytes)} · {formatDate(file.uploadedAt)} · {file.uploadedBy}
                </p>
                {file.description && <p className="mt-1 text-xs text-slate-500">{file.description}</p>}
                {(file.relatedDisclosureIds.length > 0 || file.relatedGriCodes.length > 0) && (
                  <p className="mt-1 text-xs text-emerald-600">
                    연결: 공시데이터 {file.relatedDisclosureIds.length}건 · GRI {file.relatedGriCodes.length}건
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(file);
                    setFormOpen(true);
                  }}
                  className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`"${file.fileName}" 파일을 삭제할까요?`)) onDelete(file.id);
                  }}
                  className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50"
                >
                  삭제
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <FileMetadataForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        onSave={(data) => {
          if (editing) onUpdate({ ...editing, ...data });
          else onCreate(data);
        }}
      />
    </div>
  );
}
