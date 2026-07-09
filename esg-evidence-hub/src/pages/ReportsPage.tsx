import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { ReportFormModal } from '../components/reports/ReportFormModal';
import { reportRepository, folderRepository } from '../repositories';
import { generateId } from '../lib/id';
import { REPORT_DEFAULT_FOLDERS } from '../constants';

export function ReportsPage() {
  const { reports, folders, files, refresh } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  function handleCreate(data: { year: number; title: string; description: string }) {
    const id = generateId('report');
    const now = new Date().toISOString();
    reportRepository.create({ id, ...data, createdAt: now, updatedAt: now });
    REPORT_DEFAULT_FOLDERS.forEach((name) => {
      folderRepository.create({ id: generateId('folder'), ownerType: 'report', ownerId: id, parentFolderId: null, name, createdAt: now, updatedAt: now });
    });
    refresh();
    navigate(`/reports/${id}`);
  }

  const sorted = [...reports].sort((a, b) => b.year - a.year);

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={() => setFormOpen(true)} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          + 보고서 생성
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map((report) => {
          const folderCount = folders.filter((f) => f.ownerType === 'report' && f.ownerId === report.id).length;
          const fileCount = files.filter((f) => folders.some((fo) => fo.id === f.folderId && fo.ownerId === report.id)).length;
          return (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/reports/${report.id}`)}
              className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-medium text-emerald-600">{report.year}</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">{report.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-500">{report.description}</p>
              <p className="mt-3 text-xs text-slate-400">
                📁 폴더 {folderCount}개 · 📄 파일 {fileCount}개
              </p>
            </button>
          );
        })}
      </div>

      <ReportFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleCreate} />
    </div>
  );
}
