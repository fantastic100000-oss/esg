import { useState } from 'react';
import { Card } from '../common/Card';
import { EvidenceForm } from './EvidenceForm';
import { evidenceRepository } from '../../repositories';
import { generateId } from '../../lib/id';
import { formatBytes, formatDate } from '../../lib/format';
import type { EvidenceDocument, RawDataRow } from '../../types';

export function EvidenceList({
  disclosureId,
  evidence,
  rawRows,
  onChange,
}: {
  disclosureId: string;
  evidence: EvidenceDocument[];
  rawRows: RawDataRow[];
  onChange: () => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EvidenceDocument | undefined>(undefined);

  function handleSave(data: Omit<EvidenceDocument, 'id' | 'disclosureId'>) {
    if (editing) evidenceRepository.update({ ...editing, ...data });
    else evidenceRepository.create({ id: generateId('evi'), disclosureId, ...data });
    onChange();
  }

  function handleDelete(id: string) {
    if (!confirm('증빙데이터를 삭제할까요?')) return;
    evidenceRepository.remove(id);
    onChange();
  }

  return (
    <Card
      title="증빙데이터"
      subtitle="Raw Data의 근거자료 (검증보고서와는 별도로 관리됩니다)"
      actions={
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
        >
          + 증빙데이터 등록
        </button>
      }
    >
      {evidence.length === 0 && <p className="py-4 text-center text-sm text-slate-400">등록된 증빙데이터가 없습니다.</p>}
      <ul className="space-y-2">
        {evidence.map((doc) => (
          <li key={doc.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                  📎 {doc.fileName}
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{doc.documentType}</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatBytes(doc.sizeBytes)} · {formatDate(doc.uploadedAt)} · {doc.uploadedBy} · Raw Data {doc.relatedRawDataIds.length}건 연결
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
      <EvidenceForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} rawRows={rawRows} initial={editing} />
    </Card>
  );
}
