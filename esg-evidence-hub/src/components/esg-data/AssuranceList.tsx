import { useState } from 'react';
import { Card } from '../common/Card';
import { AssuranceForm } from './AssuranceForm';
import { assuranceRepository } from '../../repositories';
import { generateId } from '../../lib/id';
import { formatBytes, formatDate } from '../../lib/format';
import type { AssuranceReport } from '../../types';

export function AssuranceList({
  disclosureId,
  assurance,
  onChange,
}: {
  disclosureId: string;
  assurance: AssuranceReport[];
  onChange: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AssuranceReport | undefined>(undefined);

  function handleSave(data: Omit<AssuranceReport, 'id' | 'relatedDisclosureIds'>) {
    if (editing) {
      assuranceRepository.update({ ...editing, ...data });
    } else {
      assuranceRepository.create({ id: generateId('assure'), relatedDisclosureIds: [disclosureId], ...data });
    }
    onChange();
  }

  function handleDelete(id: string) {
    if (!confirm('검증보고서를 삭제할까요?')) return;
    assuranceRepository.remove(id);
    onChange();
  }

  return (
    <Card
      title="검증보고서"
      subtitle="증빙데이터와 별도로 보관되는 자료입니다 (온실가스 검증보고서, 제3자 검증의견서 등)"
      actions={
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
        >
          + 검증보고서 등록
        </button>
      }
    >
      {assurance.length === 0 && <p className="py-4 text-center text-sm text-slate-400">등록된 검증보고서가 없습니다.</p>}
      <ul className="space-y-2">
        {assurance.map((doc) => (
          <li key={doc.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  🛡️ {doc.fileName}
                  <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs text-violet-700">{doc.documentType}</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatBytes(doc.sizeBytes)} · {formatDate(doc.uploadedAt)} · {doc.uploadedBy} · 보고서 {doc.relatedReportIds.length}건 · 위원회 안건 {doc.relatedCommitteeAgendaIds.length}건
                </p>
                {doc.description && <p className="mt-1 text-xs text-slate-500">{doc.description}</p>}
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(doc);
                    setFormOpen(true);
                  }}
                  className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                >
                  수정
                </button>
                <button type="button" onClick={() => handleDelete(doc.id)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                  삭제
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <AssuranceForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initial={editing} />
    </Card>
  );
}
