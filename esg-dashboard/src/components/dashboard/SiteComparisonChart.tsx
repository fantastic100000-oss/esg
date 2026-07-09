import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../common/Card';
import { siteComparisonForMonth } from '../../lib/aggregations';
import { SITE_COLOR, CHART_INK } from '../../constants/chartColors';
import type { EsgRecord, MonthKey } from '../../types';

interface SiteComparisonChartProps {
  records: EsgRecord[];
  month: MonthKey | undefined;
}

function TooltipContent({ active, payload }: { active?: boolean; payload?: { payload: { siteName: string; totalTCo2e: number } }[] }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-slate-700">{item.siteName}</p>
      <p className="text-slate-500">{item.totalTCo2e.toFixed(2)} tCO2e</p>
    </div>
  );
}

export function SiteComparisonChart({ records, month }: SiteComparisonChartProps) {
  const data = siteComparisonForMonth(records, month);

  return (
    <Card title="사업장별 배출량 비교" subtitle={month ? `${month} 기준 총 배출량 (tCO2e)` : ''}>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
            <XAxis dataKey="siteName" tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
            <YAxis tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
            <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="totalTCo2e" radius={[4, 4, 0, 0]} maxBarSize={56}>
              {data.map((entry) => (
                <Cell key={entry.siteId} fill={SITE_COLOR[entry.siteId]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
