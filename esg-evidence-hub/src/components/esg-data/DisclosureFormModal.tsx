import { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAppData } from '../../lib/AppDataContext';
import { SAMPLE_YEARS } from '../../constants';

interface DisclosureFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (itemDefId: string, year: number) => void;
}

export function DisclosureFormModal({ open, onClose, onCreate }: DisclosureFormModalProps) {
  const { disclosureItemDefs, disclosures } = useAppData();
  const [itemDefId, setItemDefId] = useState(disclosureItemDefs[0]?.id ?? '');
  const [year, setYear] = useState(SAMPLE_YEARS[SAMPLE_YEARS.length - 1]);

  const exists = disclosures.some((d) => d.itemDefId === itemDefId && d.year === year);

  return (
    <Modal open={open} onClose={onClose} title="공시 데이터 추가">
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">공시 항목</span>
          <select
            value={itemDefId}
            onChange={(e) => setItemDefId(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {disclosureItemDefs.map((def) => (
              <option key={def.id} value={def.id}>
                {def.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">공시연도</span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {SAMPLE_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        {exists && <p className="text-xs text-red-500">이미 동일한 연도·항목의 공시데이터가 존재합니다.</p>}
        <button
          type="button"
          disabled={exists}
          onClick={() => {
            onCreate(itemDefId, year);
            onClose();
          }}
          className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          생성
        </button>
      </div>
    </Modal>
  );
}
