import { useMemo, useState } from 'react';
import { GriMappingTable } from '../components/gri/GriMappingTable';
import { buildGriMapping } from '../lib/gri';
import { getSortedMonths } from '../lib/aggregations';
import { SITES } from '../constants';
import type { EsgRecord, SiteId } from '../types';

export function GriMappingPage({ records }: { records: EsgRecord[] }) {
  const months = useMemo(() => getSortedMonths(records), [records]);
  const [month, setMonth] = useState<string>('all');
  const [siteId, setSiteId] = useState<SiteId | 'all'>('all');

  const filtered = records.filter(
    (r) => (month === 'all' || r.month === month) && (siteId === 'all' || r.siteId === siteId),
  );
  const rows = buildGriMapping(filtered);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">월</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">전체 기간</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-600">사업장</span>
          <select
            value={siteId}
            onChange={(e) => setSiteId(e.target.value as SiteId | 'all')}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            <option value="all">전체 사업장</option>
            {SITES.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <GriMappingTable rows={rows} />
    </div>
  );
}
