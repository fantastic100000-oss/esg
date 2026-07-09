import { calculateEmissions } from '../../lib/calculations';
import { SITE_NAME } from '../../constants';
import { StatusBadge } from '../common/StatusBadge';
import type { EsgRecord, ValidationFlags } from '../../types';

interface DataTableProps {
  records: EsgRecord[];
  validationMap: Map<string, ValidationFlags>;
  selectedId: string | null;
  onSelectRecord: (id: string) => void;
}

function cellClass(isOutlier: boolean) {
  return isOutlier ? 'bg-amber-50 font-semibold text-amber-700' : '';
}

export function DataTable({ records, validationMap, selectedId, onSelectRecord }: DataTableProps) {
  const sorted = [...records].sort((a, b) => (a.month === b.month ? a.siteId.localeCompare(b.siteId) : b.month.localeCompare(a.month)));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full whitespace-nowrap text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">사업장</th>
            <th className="px-4 py-3">월</th>
            <th className="px-4 py-3 text-right">전력(kWh)</th>
            <th className="px-4 py-3 text-right">도시가스(m³)</th>
            <th className="px-4 py-3 text-right">차량연료(L)</th>
            <th className="px-4 py-3 text-right">용수(m³)</th>
            <th className="px-4 py-3 text-right">폐기물(kg)</th>
            <th className="px-4 py-3 text-right">Scope1</th>
            <th className="px-4 py-3 text-right">Scope2</th>
            <th className="px-4 py-3">증빙</th>
            <th className="px-4 py-3">상태</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((record) => {
            const validation = validationMap.get(record.id);
            const emissions = calculateEmissions(record);
            const isSelected = record.id === selectedId;
            return (
              <tr
                key={record.id}
                onClick={() => onSelectRecord(record.id)}
                className={`cursor-pointer transition-colors hover:bg-slate-50 ${isSelected ? 'bg-emerald-50' : ''}`}
              >
                <td className="px-4 py-3 font-medium text-slate-700">{SITE_NAME[record.siteId]}</td>
                <td className="px-4 py-3 text-slate-500">{record.month}</td>
                <td className={`px-4 py-3 text-right ${cellClass(!!validation?.outlierFields.includes('electricityKwh'))}`}>
                  {record.electricityKwh.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right ${cellClass(!!validation?.outlierFields.includes('cityGasM3'))}`}>
                  {record.cityGasM3.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right ${cellClass(!!validation?.outlierFields.includes('vehicleFuelL'))}`}>
                  {record.vehicleFuelL.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right ${cellClass(!!validation?.outlierFields.includes('waterM3'))}`}>
                  {record.waterM3.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right ${cellClass(!!validation?.outlierFields.includes('wasteKg'))}`}>
                  {record.wasteKg.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-slate-500">{emissions.scope1TCo2e.toFixed(2)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{emissions.scope2TCo2e.toFixed(2)}</td>
                <td className="px-4 py-3">
                  {validation?.missingEvidence ? (
                    <span className="text-xs font-medium text-red-600">⚠ 미입력</span>
                  ) : (
                    <span className="max-w-[140px] truncate text-xs text-slate-500" title={record.evidenceFileName}>
                      {record.evidenceFileName}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={record.status} />
                </td>
              </tr>
            );
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={11} className="px-4 py-8 text-center text-slate-400">
                등록된 데이터가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
