import { Card } from '../common/Card';
import type { GriRow } from '../../lib/gri';

export function GriMappingTable({ rows }: { rows: GriRow[] }) {
  return (
    <Card title="GRI 공시 매핑" subtitle="입력된 ESG 데이터를 GRI Standards 항목에 매핑합니다.">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-4">GRI 코드</th>
              <th className="py-2 pr-4">공시 항목</th>
              <th className="py-2 pr-4">값</th>
              <th className="py-2 pr-4">산출 근거</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.code}>
                <td className="py-3 pr-4 font-mono text-xs font-semibold text-emerald-700">{row.code}</td>
                <td className="py-3 pr-4 font-medium text-slate-700">{row.title}</td>
                <td className="py-3 pr-4 text-slate-700">{row.value}</td>
                <td className="py-3 pr-4 text-xs text-slate-400">{row.sourceFields}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
