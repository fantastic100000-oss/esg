import { useState } from 'react';
import { Modal } from '../common/Modal';
import { REPORT_DEFAULT_FOLDERS } from '../../constants';
import type { SustainabilityReport } from '../../types';

interface ReportFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { year: number; title: string; description: string }) => void;
  initial?: SustainabilityReport;
}

export function ReportFormModal({ open, onClose, onSave, initial }: ReportFormModalProps) {
  const [year, setYear] = useState(initial?.year ?? new Date().getFullYear());
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ year, title: title.trim(), description });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '보고서 수정' : '보고서 생성'}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <span className="mb-1 block font-medium text-slate-600">보고서명</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`예: ${year} 지속가능경영보고서`}
            required
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
        {!initial && (
          <p className="text-xs text-slate-400">생성 시 기본 폴더({REPORT_DEFAULT_FOLDERS.join(', ')})가 자동으로 만들어집니다.</p>
        )}
        <button type="submit" className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          저장
        </button>
      </form>
    </Modal>
  );
}
