import { Card } from '../common/Card';
import { growthRate, previousMonth } from '../../lib/calculations';
import { aggregateForMonth } from '../../lib/aggregations';
import type { EsgRecord, MonthKey } from '../../types';

interface SummaryCardsProps {
  records: EsgRecord[];
  latestMonth: MonthKey | undefined;
}

interface KpiDef {
  label: string;
  unit: string;
  value: number;
  previous: number;
}

function GrowthTag({ rate }: { rate: number | undefined }) {
  if (rate === undefined) {
    return <span className="text-xs text-slate-400">전월 데이터 없음</span>;
  }
  const pct = (rate * 100).toFixed(1);
  const isUp = rate > 0;
  const isFlat = Math.abs(rate) < 0.001;
  const color = isFlat ? 'text-slate-400' : isUp ? 'text-red-600' : 'text-blue-600';
  const arrow = isFlat ? '·' : isUp ? '▲' : '▼';
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {arrow} 전월 대비 {pct}%
    </span>
  );
}

export function SummaryCards({ records, latestMonth }: SummaryCardsProps) {
  const prevMonth = latestMonth ? previousMonth(latestMonth) : undefined;
  const current = aggregateForMonth(records, latestMonth);
  const previous = aggregateForMonth(records, prevMonth);

  const kpis: KpiDef[] = [
    { label: '총 온실가스 배출량', unit: 'tCO2e', value: current.totalTCo2e, previous: previous.totalTCo2e },
    { label: '전력 사용량', unit: 'kWh', value: current.electricityKwh, previous: previous.electricityKwh },
    { label: '용수 사용량', unit: 'm³', value: current.waterM3, previous: previous.waterM3 },
    { label: '폐기물 발생량', unit: 'kg', value: current.wasteKg, previous: previous.wasteKg },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <p className="text-sm font-medium text-slate-500">{kpi.label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {kpi.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="ml-1 text-sm font-normal text-slate-400">{kpi.unit}</span>
          </p>
          <div className="mt-2">
            <GrowthTag rate={growthRate(kpi.value, kpi.previous)} />
          </div>
        </Card>
      ))}
    </div>
  );
}
