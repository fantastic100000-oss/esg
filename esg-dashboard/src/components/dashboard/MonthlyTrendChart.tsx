import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../common/Card';
import { monthlyTrendData } from '../../lib/aggregations';
import type { TrendMetric } from '../../lib/aggregations';
import { SITES } from '../../constants';
import { SITE_COLOR, CHART_INK } from '../../constants/chartColors';
import type { EsgRecord } from '../../types';

const METRIC_OPTIONS: { value: TrendMetric; label: string; unit: string }[] = [
  { value: 'totalTCo2e', label: '총 배출량', unit: 'tCO2e' },
  { value: 'electricityKwh', label: '전력 사용량', unit: 'kWh' },
  { value: 'waterM3', label: '용수 사용량', unit: 'm³' },
  { value: 'wasteKg', label: '폐기물 발생량', unit: 'kg' },
];

interface MonthlyTrendChartProps {
  records: EsgRecord[];
}

export function MonthlyTrendChart({ records }: MonthlyTrendChartProps) {
  const [metric, setMetric] = useState<TrendMetric>('totalTCo2e');
  const data = monthlyTrendData(records, metric);
  const activeOption = METRIC_OPTIONS.find((o) => o.value === metric)!;

  return (
    <Card title="월별 추이" subtitle={`최근 6개월 · ${activeOption.unit}`}>
      <div className="mb-3 flex flex-wrap gap-2">
        {METRIC_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setMetric(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              metric === opt.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
            <YAxis tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={56} />
            <Tooltip
              contentStyle={{ borderRadius: 8, borderColor: '#e1e0d9', fontSize: 12 }}
              formatter={(value) => [`${Number(value).toLocaleString()} ${activeOption.unit}`]}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {SITES.map((site) => (
              <Line
                key={site.id}
                type="monotone"
                dataKey={site.id}
                name={site.name}
                stroke={SITE_COLOR[site.id]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
