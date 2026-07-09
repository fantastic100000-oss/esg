import { useState } from 'react';
import { FolderTree } from './FolderTree';
import { FileList } from './FileList';
import { folderRepository, fileRepository } from '../../repositories';
import { generateId } from '../../lib/id';
import type { FileMetadata, Folder, FolderOwnerType } from '../../types';

interface FolderFileManagerProps {
  ownerType: FolderOwnerType;
  ownerId: string;
  folders: Folder[];
  files: FileMetadata[];
  onChange: () => void;
}

export function FolderFileManager({ ownerType, ownerId, folders, files, onChange }: FolderFileManagerProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders[0]?.id ?? null);

  function handleCreateRootFolder() {
    const name = prompt('생성할 폴더명을 입력하세요.');
    if (!name?.trim()) return;
    const now = new Date().toISOString();
    folderRepository.create({ id: generateId('folder'), ownerType, ownerId, parentFolderId: null, name: name.trim(), createdAt: now, updatedAt: now });
    onChange();
  }

  function handleCreateSubfolder(parentFolderId: string) {
    const name = prompt('생성할 하위 폴더명을 입력하세요.');
    if (!name?.trim()) return;
    const now = new Date().toISOString();
    folderRepository.create({ id: generateId('folder'), ownerType, ownerId, parentFolderId, name: name.trim(), createdAt: now, updatedAt: now });
    onChange();
  }

  function handleRenameFolder(folderId: string) {
    const folder = folderRepository.getById(folderId);
    if (!folder) return;
    const name = prompt('새 폴더명을 입력하세요.', folder.name);
    if (!name?.trim()) return;
    folderRepository.update({ ...folder, name: name.trim(), updatedAt: new Date().toISOString() });
    onChange();
  }

  function collectDescendantFolderIds(folderId: string): string[] {
    const all = folderRepository.getAll();
    const result: string[] = [folderId];
    let frontier = [folderId];
    while (frontier.length > 0) {
      const next = all.filter((f) => frontier.includes(f.parentFolderId ?? ''));
      result.push(...next.map((f) => f.id));
      frontier = next.map((f) => f.id);
    }
    return result;
  }

  function handleDeleteFolder(folderId: string) {
    if (!confirm('폴더를 삭제하면 하위 폴더와 파일도 모두 삭제됩니다. 계속할까요?')) return;
    const idsToDelete = collectDescendantFolderIds(folderId);
    idsToDelete.forEach((id) => folderRepository.remove(id));
    fileRepository.getAll().filter((f) => idsToDelete.includes(f.folderId)).forEach((f) => fileRepository.remove(f.id));
    if (selectedFolderId && idsToDelete.includes(selectedFolderId)) setSelectedFolderId(null);
    onChange();
  }

  function handleCreateFile(data: Omit<FileMetadata, 'id' | 'folderId'>) {
    if (!selectedFolderId) return;
    fileRepository.create({ id: generateId('file'), folderId: selectedFolderId, ...data });
    onChange();
  }

  function handleUpdateFile(file: FileMetadata) {
    fileRepository.update(file);
    onChange();
  }

  function handleDeleteFile(fileId: string) {
    fileRepository.remove(fileId);
    onChange();
  }

  const filesInFolder = files.filter((f) => f.folderId === selectedFolderId);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-1">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">폴더</h3>
          <button type="button" onClick={handleCreateRootFolder} className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
            + 폴더 생성
          </button>
        </div>
        <FolderTree
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelect={setSelectedFolderId}
          onCreateSubfolder={handleCreateSubfolder}
          onRename={handleRenameFolder}
          onDelete={handleDeleteFolder}
        />
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
        <FileList folderId={selectedFolderId} files={filesInFolder} onCreate={handleCreateFile} onUpdate={handleUpdateFile} onDelete={handleDeleteFile} />
      </div>
    </div>
  );
}
