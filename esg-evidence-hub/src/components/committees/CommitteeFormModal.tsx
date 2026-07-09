import { useState } from 'react';
import { Modal } from '../common/Modal';
import { COMMITTEE_DEFAULT_FOLDERS } from '../../constants';
import type { ESGCommittee } from '../../types';

interface CommitteeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { year: number; round: number; name: string; date: string; description: string }) => void;
  initial?: ESGCommittee;
}

export function CommitteeFormModal({ open, onClose, onSave, initial }: CommitteeFormModalProps) {
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear());
  const [round, setRound] = useState(initial?.round ?? 1);
  const [name, setName] = useState(initial?.name ?? '');
  const [date, setDate] = useState(initial?.date.slice(0, 10) ?? new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState(initial?.description ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ year, round, name: name.trim(), date: new Date(date).toISOString(), description });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '위원회 수정' : '위원회 생성'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">연도</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">차수</span>
            <input
              type="number"
              value={round}
              onChange={(e) => setRound(Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">위원회명</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`예: ${year}년 ${round}차 ESG위원회`}
            required
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">개최일</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">설명</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        {!initial && <p className="text-xs text-slate-400">생성 시 기본 폴더({COMMITTEE_DEFAULT_FOLDERS.join(', ')})가 자동으로 만들어집니다.</p>}
        <button type="submit" className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          저장
        </button>
      </form>
    </Modal>
  );
}
