import { useState } from 'react';
import { useAppData } from '../lib/AppDataContext';
import { Badge } from '../components/common/Badge';
import { GriDetailModal } from '../components/gri/GriDetailModal';
import { getGriMappingInfo } from '../services/griMappingService';

export function GriStandardsPage() {
  const { gri } = useAppData();
  const [view, setView] = useState<'card' | 'table'>('card');
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const selectedStandard = gri.find((g) => g.code === selectedCode);
  const selectedMapping = selectedCode ? getGriMappingInfo(selectedCode) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setView('card')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'card' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}
        >
          카드형
        </button>
        <button
          type="button"
          onClick={() => setView('table')}
          className={`rounded-md px-3 py-1.5 text-sm font-medium ${view === 'table' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-300'}`}
        >
          테이블형
        </button>
      </div>

      {view === 'card' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gri.map((standard) => {
            const mapping = getGriMappingInfo(standard.code);
            return (
              <button
                key={standard.id}
                type="button"
                onClick={() => setSelectedCode(standard.code)}
                className="rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-xs font-mono font-semibold text-emerald-700">{standard.code}</p>
                <h3 className="mt-1 text-base font-bold text-slate-900">{standard.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{standard.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge label={`공시항목 ${mapping.relatedDisclosures.length}건`} tone="bg-blue-100 text-blue-700" />
                  <Badge
                    label={mapping.reportReferenced ? '보고서 반영됨' : '보고서 미반영'}
                    tone={mapping.reportReferenced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full whitespace-nowrap text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">GRI 코드</th>
                <th className="px-4 py-3">항목명</th>
                <th className="px-4 py-3 text-right">관련 공시항목</th>
                <th className="px-4 py-3 text-right">Raw Data</th>
                <th className="px-4 py-3 text-right">증빙데이터</th>
                <th className="px-4 py-3">보고서 반영여부</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gri.map((standard) => {
                const mapping = getGriMappingInfo(standard.code);
                return (
                  <tr key={standard.id} onClick={() => setSelectedCode(standard.code)} className="cursor-pointer hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-700">{standard.code}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{standard.title}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{mapping.relatedDisclosures.length}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{mapping.relatedRawDataCount}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{mapping.relatedEvidenceCount}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={mapping.reportReferenced ? '반영됨' : '미반영'}
                        tone={mapping.reportReferenced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <GriDetailModal open={!!selectedCode} onClose={() => setSelectedCode(null)} standard={selectedStandard} mapping={selectedMapping} />
    </div>
  );
}
