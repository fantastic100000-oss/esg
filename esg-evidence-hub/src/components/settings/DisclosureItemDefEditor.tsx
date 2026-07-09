import { useState } from 'react';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';
import { useAppData } from '../../lib/AppDataContext';
import { disclosureItemDefRepository } from '../../repositories';
import { generateId } from '../../lib/id';
import type { DisclosureItemDef } from '../../constants';

function ItemDefFormModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<DisclosureItemDef, 'id'>) => void;
  initial?: DisclosureItemDef;
}) {
  const { categories } = useAppData();
  const [name, setName] = useState(initial?.name ?? '');
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? '');
  const [unit, setUnit] = useState(initial?.unit ?? '');
  const [defaultGriCodes, setDefaultGriCodes] = useState(initial?.defaultGriCodes.join(', ') ?? '');
  const [calculationBasis, setCalculationBasis] = useState(initial?.calculationBasis ?? '');
  const [calculationFormula, setCalculationFormula] = useState(initial?.calculationFormula ?? '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      categoryId,
      unit,
      defaultGriCodes: defaultGriCodes.split(',').map((s) => s.trim()).filter(Boolean),
      calculationBasis,
      calculationFormula,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '공시 항목 수정' : '공시 항목 추가'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">항목명</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">카테고리</span>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">단위</span>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">기본 GRI 코드 (쉼표로 구분)</span>
          <input
            value={defaultGriCodes}
            onChange={(e) => setDefaultGriCodes(e.target.value)}
            placeholder="예: GRI 305-1, GRI 305-2"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">산정기준</span>
          <textarea value={calculationBasis} onChange={(e) => setCalculationBasis(e.target.value)} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">산정식</span>
          <textarea value={calculationFormula} onChange={(e) => setCalculationFormula(e.target.value)} rows={2} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none" />
        </label>
        <button type="submit" className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          저장
        </button>
      </form>
    </Modal>
  );
}

export function DisclosureItemDefEditor() {
  const { disclosureItemDefs, categories, refresh } = useAppData();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DisclosureItemDef | undefined>(undefined);

  function handleSave(data: Omit<DisclosureItemDef, 'id'>) {
    if (editing) disclosureItemDefRepository.update({ ...editing, ...data });
    else disclosureItemDefRepository.create({ id: generateId('item'), ...data });
    refresh();
  }

  function handleDelete(def: DisclosureItemDef) {
    if (!confirm(`"${def.name}" 공시 항목을 삭제할까요? (기존에 생성된 공시데이터는 유지됩니다)`)) return;
    disclosureItemDefRepository.remove(def.id);
    refresh();
  }

  return (
    <Card
      title="공시 항목"
      actions={
        <button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setFormOpen(true);
          }}
          className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
        >
          + 추가
        </button>
      }
    >
      <ul className="space-y-1">
        {disclosureItemDefs.map((def) => (
          <li key={def.id} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-slate-50">
            <div>
              <span className="text-slate-700">{def.name}</span>
              <span className="ml-2 text-xs text-slate-400">
                {categories.find((c) => c.id === def.categoryId)?.name} · {def.unit}
                {def.defaultGriCodes.length > 0 ? ` · ${def.defaultGriCodes.join(', ')}` : ''}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setEditing(def);
                  setFormOpen(true);
                }}
                className="rounded px-2 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
              >
                수정
              </button>
              <button type="button" onClick={() => handleDelete(def)} className="rounded px-2 py-0.5 text-xs text-red-500 hover:bg-red-50">
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ItemDefFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} initial={editing} />
    </Card>
  );
}
