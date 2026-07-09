import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { committeeRepository, folderRepository, fileRepository } from '../repositories';
import { CommitteeFormModal } from '../components/committees/CommitteeFormModal';
import { AgendaManager } from '../components/committees/AgendaManager';
import { FolderFileManager } from '../components/folder/FolderFileManager';
import { Card } from '../components/common/Card';
import type { CommitteeAgendaItem } from '../types';

export function CommitteeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { committees, folders, files, refresh } = useAppData();
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();

  const committee = committees.find((c) => c.id === id);
  if (!committee) {
    return <p className="text-sm text-slate-400">위원회를 찾을 수 없습니다.</p>;
  }

  const ownFolders = folders.filter((f) => f.ownerType === 'committee' && f.ownerId === committee.id);
  const ownFolderIds = new Set(ownFolders.map((f) => f.id));
  const ownFiles = files.filter((f) => ownFolderIds.has(f.folderId));

  function handleDelete() {
    if (!confirm(`"${committee!.name}"를 삭제할까요? 하위 폴더와 파일도 모두 삭제됩니다.`)) return;
    ownFolders.forEach((f) => folderRepository.remove(f.id));
    ownFiles.forEach((f) => fileRepository.remove(f.id));
    committeeRepository.remove(committee!.id);
    refresh();
    navigate('/committees');
  }

  function handleUpdateAgendas(agendaItems: CommitteeAgendaItem[]) {
    committeeRepository.update({ ...committee!, agendaItems, updatedAt: new Date().toISOString() });
    refresh();
  }

  return (
    <div className="space-y-6">
      <Card
        actions={
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditOpen(true)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              수정
            </button>
            <button type="button" onClick={handleDelete} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
              삭제
            </button>
          </div>
        }
      >
        <p className="text-xs font-medium text-emerald-600">{committee.date.slice(0, 10)}</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{committee.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{committee.description}</p>
      </Card>

      <AgendaManager committee={committee} onUpdateAgendas={handleUpdateAgendas} />

      <FolderFileManager ownerType="committee" ownerId={committee.id} folders={ownFolders} files={ownFiles} onChange={refresh} />

      <CommitteeFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={committee}
        onSave={(data) => {
          committeeRepository.update({ ...committee, ...data, updatedAt: new Date().toISOString() });
          refresh();
        }}
      />
    </div>
  );
}
