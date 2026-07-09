import { useState } from 'react';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { MultiSelectChecklist } from '../common/MultiSelectChecklist';
import { useAppData } from '../../lib/AppDataContext';
import { generateId } from '../../lib/id';
import type { CommitteeAgendaItem, ESGCommittee } from '../../types';

function AgendaFormModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, relatedDisclosureIds: string[]) => void;
  initial?: CommitteeAgendaItem;
}) {
  const { disclosures } = useAppData();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [relatedDisclosureIds, setRelatedDisclosureIds] = useState<string[]>(initial?.relatedDisclosureIds ?? []);

  return (
    <Modal open={open} onClose={onClose} title={initial ? '안건 수정' : '안건 추가'}>
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">안건명</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 기후변화 대응 안건"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">관련 ESG 데이터</span>
          <MultiSelectChecklist
            options={disclosures.map((d) => ({ id: d.id, label: d.name, group: String(d.year) }))}
            selected={relatedDisclosureIds}
            onChange={setRelatedDisclosureIds}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            if (!title.trim()) return;
            onSave(title.trim(), relatedDisclosureIds);
            onClose();
          }}
          className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          저장
        </button>
      </div>
    </Modal>
  );
}

export function AgendaManager({ committee, onUpdateAgendas }: { committee: ESGCommittee; onUpdateAgendas: (agendas: CommitteeAgendaItem[]) => void }) {
  const { disclosures } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CommitteeAgendaItem | undefined>(undefined);

  function handleAdd(title: string, relatedDisclosureIds: string[]) {
    if (editing) {
      onUpdateAgendas(committee.agendaItems.map((a) => (a.id === editing.id ? { ...a, title, relatedDisclosureIds } : a)));
    } else {
      const newAgenda: CommitteeAgendaItem = { id: generateId('agenda'), committeeId: committee.id, title, relatedDisclosureIds };
      onUpdateAgendas([...committee.agendaItems, newAgenda]);
    }
  }

  function handleDelete(agendaId: string) {
    if (!confirm('안건을 삭제할까요?')) return;
    onUpdateAgendas(committee.agendaItems.filter((a) => a.id !== agendaId));
  }

  return (
    <Card
      title="안건"
      actions={
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
        >
          + 안건 추가
        </button>
      }
    >
      {committee.agendaItems.length === 0 && <p className="py-4 text-center text-sm text-slate-400">등록된 안건이 없습니다.</p>}
      <ul className="space-y-2">
        {committee.agendaItems.map((agenda) => (
          <li key={agenda.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{agenda.title}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {agenda.relatedDisclosureIds.length === 0
                    ? '연결된 ESG 데이터 없음'
                    : agenda.relatedDisclosureIds
                        .map((id) => disclosures.find((d) => d.id === id)?.name)
                        .filter(Boolean)
                        .join(' → ')}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(agenda);
                    setFormOpen(true);
                  }}
                  className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                >
                  수정
                </button>
                <button type="button" onClick={() => handleDelete(agenda.id)} className="rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                  삭제
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <AgendaFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleAdd} initial={editing} />
    </Card>
  );
}
