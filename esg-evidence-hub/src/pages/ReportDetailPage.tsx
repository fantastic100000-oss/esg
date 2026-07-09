import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { reportRepository, folderRepository, fileRepository } from '../repositories';
import { ReportFormModal } from '../components/reports/ReportFormModal';
import { FolderFileManager } from '../components/folder/FolderFileManager';
import { Card } from '../components/common/Card';

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { reports, folders, files, refresh } = useAppData();
  const [editOpen, setEditOpen] = useState(false);
  const navigate = useNavigate();

  const report = reports.find((r) => r.id === id);
  if (!report) {
    return <p className="text-sm text-slate-400">보고서를 찾을 수 없습니다.</p>;
  }

  const ownFolders = folders.filter((f) => f.ownerType === 'report' && f.ownerId === report.id);
  const ownFolderIds = new Set(ownFolders.map((f) => f.id));
  const ownFiles = files.filter((f) => ownFolderIds.has(f.folderId));

  function handleDeleteReport() {
    if (!confirm(`"${report!.title}"를 삭제할까요? 하위 폴더와 파일도 모두 삭제됩니다.`)) return;
    ownFolders.forEach((f) => folderRepository.remove(f.id));
    ownFiles.forEach((f) => fileRepository.remove(f.id));
    reportRepository.remove(report!.id);
    refresh();
    navigate('/reports');
  }

  return (
    <div className="space-y-6">
      <Card
        actions={
          <div className="flex gap-2">
            <button type="button" onClick={() => setEditOpen(true)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              수정
            </button>
            <button type="button" onClick={handleDeleteReport} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
              삭제
            </button>
          </div>
        }
      >
        <p className="text-xs font-medium text-emerald-600">{report.year}</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">{report.title}</h2>
        <p className="mt-1 text-sm text-slate-500">{report.description}</p>
      </Card>

      <FolderFileManager ownerType="report" ownerId={report.id} folders={ownFolders} files={ownFiles} onChange={refresh} />

      <ReportFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initial={report}
        onSave={(data) => {
          reportRepository.update({ ...report, ...data, updatedAt: new Date().toISOString() });
          refresh();
        }}
      />
    </div>
  );
}
