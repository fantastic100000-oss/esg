import { useState } from 'react';
import { Card } from '../common/Card';
import { MultiSelectChecklist } from '../common/MultiSelectChecklist';
import { useAppData } from '../../lib/AppDataContext';
import { disclosureRepository } from '../../repositories';
import type { DisclosureData } from '../../types';

export function DisclosureInfoPanel({ disclosure, onChange }: { disclosure: DisclosureData; onChange: () => void }) {
  const { departments, verificationStatuses, categories, gri } = useAppData();
  const [calculationBasis, setCalculationBasis] = useState(disclosure.calculationBasis);
  const [calculationFormula, setCalculationFormula] = useState(disclosure.calculationFormula);

  function save(patch: Partial<DisclosureData>) {
    disclosureRepository.update({ ...disclosure, ...patch, updatedAt: new Date().toISOString() });
    onChange();
  }

  return (
    <Card title="공시 정보">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-400">공시항목명</p>
            <p className="text-sm font-semibold text-slate-800">{disclosure.name}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-slate-400">공시연도</p>
              <p className="text-sm text-slate-700">{disclosure.year}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">카테고리</p>
              <p className="text-sm text-slate-700">{categories.find((c) => c.id === disclosure.categoryId)?.name}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400">공시값 (Raw Data 합계로 자동 계산)</p>
            <p className="text-lg font-bold text-emerald-700">
              {disclosure.value.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-sm font-normal text-slate-400">{disclosure.unit}</span>
            </p>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-400">담당부서</span>
            <select
              value={disclosure.departmentId}
              onChange={(e) => save({ departmentId: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-400">상태</span>
            <select
              value={disclosure.status}
              onChange={(e) => save({ status: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              {verificationStatuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-400">산정기준</span>
            <textarea
              value={calculationBasis}
              onChange={(e) => setCalculationBasis(e.target.value)}
              onBlur={() => save({ calculationBasis })}
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-400">산정식</span>
            <textarea
              value={calculationFormula}
              onChange={(e) => setCalculationFormula(e.target.value)}
              onBlur={() => save({ calculationFormula })}
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-slate-400">관련 GRI</span>
            <MultiSelectChecklist
              options={gri.map((g) => ({ id: g.code, label: `${g.code} ${g.title}` }))}
              selected={disclosure.griCodes}
              onChange={(griCodes) => save({ griCodes })}
            />
          </label>
        </div>
      </div>
    </Card>
  );
}
