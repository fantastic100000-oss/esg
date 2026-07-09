import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { CommitteeFormModal } from '../components/committees/CommitteeFormModal';
import { committeeRepository, folderRepository } from '../repositories';
import { generateId } from '../lib/id';
import { COMMITTEE_DEFAULT_FOLDERS } from '../constants';

export function CommitteesPage() {
  const { committees, folders, files, refresh } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  function handleCreate(data: { year: number; round: number; name: string; date: string; description: string }) {
    const id = generateId('committee');
    const now = new Date().toISOString();
    committeeRepository.create({ id, ...data, agendaItems: [], createdAt: now, updatedAt: now });
    COMMITTEE_DEFAULT_FOLDERS.forEach((name) => {
      folderRepository.create({ id: generateId('folder'), ownerType: 'committee', ownerId: id, parentFolderId: null, name, createdAt: now, updatedAt: now });
    });
    refresh();
    navigate(`/committees/${id}`);
  }

  const sorted = [...committees].sort((a, b) => (b.year - a.year) || (b.round - a.round));

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => setFormOpen(true)} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          + 위원회 생성
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((committee) => {
          const folderCount = folders.filter((f) => f.ownerType === 'committee' && f.ownerId === committee.id).length;
          const fileCount = files.filter((f) => folders.some((fo) => fo.id === f.folderId && fo.ownerId === committee.id)).length;
          return (
            <button
              key={committee.id}
              type="button"
              onClick={() => navigate(`/committees/${committee.id}`)}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-medium text-emerald-600">{committee.date.slice(0, 10)}</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">{committee.name}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{committee.description}</p>
              <p className="mt-3 text-xs text-slate-400">
                🗂 안건 {committee.agendaItems.length}건 · 📁 폴더 {folderCount}개 · 📄 파일 {fileCount}개
              </p>
            </button>
          );
        })}
      </div>

      <CommitteeFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleCreate} />
    </div>
  );
}
