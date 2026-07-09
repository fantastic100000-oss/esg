import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { Badge } from '../components/common/Badge';
import { DisclosureFormModal } from '../components/esg-data/DisclosureFormModal';
import { disclosureRepository } from '../repositories';
import { generateId } from '../lib/id';
import { SAMPLE_YEARS } from '../constants';
import { formatDate } from '../lib/format';

export function EsgDataListPage() {
  const { disclosures, disclosureItemDefs, categories, departments, verificationStatuses, rawData, evidence, refresh } = useAppData();
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
  const [formOpen, setFormOpen] = useState(false);
  const navigate = useNavigate();

  const nameOf = (list: { id: string; name: string }[], id: string) => list.find((i) => i.id === id)?.name ?? id;

  const filtered = disclosures
    .filter((d) => yearFilter === 'all' || d.year === yearFilter)
    .filter((d) => categoryFilter === 'all' || d.categoryId === categoryFilter)
    .sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));

  function handleCreate(itemDefId: string, year: number) {
    const def = disclosureItemDefs.find((d) => d.id === itemDefId);
    if (!def) return;
    const now = new Date().toISOString();
    disclosureRepository.create({
      id: generateId('disc'),
      itemDefId,
      year,
      categoryId: def.categoryId,
      name: def.name,
      value: 0,
      unit: def.unit,
      calculationBasis: def.calculationBasis,
      calculationFormula: def.calculationFormula,
      departmentId: departments[0]?.id ?? '',
      status: verificationStatuses.find((s) => s.name === '미검증')?.id ?? verificationStatuses[0]?.id ?? '',
      griCodes: [...def.defaultGriCodes],
      createdAt: now,
      updatedAt: now,
    });
    refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-600">공시연도</span>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">전체</option>
              {SAMPLE_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="font-medium text-slate-600">카테고리</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">전체</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="button" onClick={() => setFormOpen(true)} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
          + 공시 데이터 추가
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full whitespace-nowrap text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">공시연도</th>
              <th className="px-4 py-3">카테고리</th>
              <th className="px-4 py-3">공시항목명</th>
              <th className="px-4 py-3 text-right">공시값</th>
              <th className="px-4 py-3">단위</th>
              <th className="px-4 py-3">담당부서</th>
              <th className="px-4 py-3">GRI 코드</th>
              <th className="px-4 py-3 text-right">Raw Data</th>
              <th className="px-4 py-3 text-right">증빙데이터</th>
              <th className="px-4 py-3">검증상태</th>
              <th className="px-4 py-3">최종수정일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => {
              const rawCount = rawData.filter((r) => r.disclosureId === d.id).length;
              const evidenceCount = evidence.filter((e) => e.disclosureId === d.id).length;
              return (
                <tr key={d.id} onClick={() => navigate(`/esg-data/${d.id}`)} className="cursor-pointer hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500">{d.year}</td>
                  <td className="px-4 py-3">
                    <Badge label={nameOf(categories, d.categoryId)} />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{d.name}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">{d.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                  <td className="px-4 py-3 text-slate-500">{d.unit}</td>
                  <td className="px-4 py-3 text-slate-500">{nameOf(departments, d.departmentId)}</td>
                  <td className="px-4 py-3 text-slate-500">{d.griCodes.join(', ') || '-'}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{rawCount}</td>
                  <td className="px-4 py-3 text-right text-slate-500">{evidenceCount}</td>
                  <td className="px-4 py-3">
                    <Badge label={nameOf(verificationStatuses, d.status)} />
                  </td>
                  <td className="px-4 py-3 text-slate-400">{formatDate(d.updatedAt)}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                  조건에 맞는 공시데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <DisclosureFormModal open={formOpen} onClose={() => setFormOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
