import type { ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card } from '../common/Card';
import {
  getCategoryShare,
  getMetricLabel,
  getMetricUnit,
  getMetricValue,
  getSiteComparison,
  getStatusBreakdown,
  getYearTrend,
  isItemMetric,
} from '../../services/dashboardService';
import { CATEGORY_COLOR, CHART_INK, SEQUENTIAL_BLUE, SITE_COLOR, STATUS_COLOR } from '../../constants/chartColors';
import type { ChartType, DashboardCardConfig } from '../../types';

const CHART_TYPE_LABEL: Record<ChartType, string> = {
  kpi: '카드(단일값)',
  yearTrend: '연도별 추이',
  siteCompare: '사업장별 비교',
  categoryShare: '카테고리별 비중',
  statusBreakdown: '상태별 현황',
};

interface DashboardCardProps {
  config: DashboardCardConfig;
  year: number;
  onRemove: () => void;
  onChangeChartType: (chartType: ChartType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function CardChrome({
  title,
  config,
  onRemove,
  onChangeChartType,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  children,
}: DashboardCardProps & { title: string; children: ReactNode }) {
  return (
    <Card
      title={title}
      actions={
        <div className="flex items-center gap-1">
          <select
            value={config.chartType}
            onChange={(e) => onChangeChartType(e.target.value as ChartType)}
            className="rounded border border-slate-200 px-1.5 py-1 text-xs text-slate-500 focus:outline-none"
          >
            {Object.entries(CHART_TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button type="button" onClick={onMoveUp} disabled={isFirst} className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-100 disabled:opacity-30">
            ▲
          </button>
          <button type="button" onClick={onMoveDown} disabled={isLast} className="rounded px-1.5 py-1 text-xs text-slate-400 hover:bg-slate-100 disabled:opacity-30">
            ▼
          </button>
          <button type="button" onClick={onRemove} className="rounded px-1.5 py-1 text-xs text-red-400 hover:bg-red-50">
            ✕
          </button>
        </div>
      }
    >
      {children}
    </Card>
  );
}

export function DashboardCard(props: DashboardCardProps) {
  const { config, year } = props;
  const label = getMetricLabel(config.metricKey);
  const unit = getMetricUnit(config.metricKey);

  if (config.chartType === 'kpi') {
    const value = getMetricValue(config.metricKey, year);
    return (
      <CardChrome {...props} title={label}>
        <p className="text-2xl font-bold text-slate-900">
          {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>
        </p>
      </CardChrome>
    );
  }

  if (config.chartType === 'yearTrend') {
    const data = getYearTrend(config.metricKey);
    return (
      <CardChrome {...props} title={`${label} · 연도별 추이`}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
              <XAxis dataKey="year" tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
              <YAxis tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e1e0d9', fontSize: 12 }} formatter={(v) => [`${Number(v).toLocaleString()} ${unit}`, label]} />
              <Line type="monotone" dataKey="value" stroke={SEQUENTIAL_BLUE} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardChrome>
    );
  }

  if (config.chartType === 'siteCompare') {
    if (!isItemMetric(config.metricKey)) {
      return (
        <CardChrome {...props} title={`${label} · 사업장별 비교`}>
          <p className="py-8 text-center text-sm text-slate-400">이 지표는 사업장별 비교를 지원하지 않습니다.</p>
        </CardChrome>
      );
    }
    const data = getSiteComparison(config.metricKey, year);
    return (
      <CardChrome {...props} title={`${label} · 사업장별 비교 (${year})`}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
              <XAxis dataKey="siteName" tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
              <YAxis tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e1e0d9', fontSize: 12 }} formatter={(v) => [`${Number(v).toLocaleString()} ${unit}`, label]} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={56}>
                {data.map((entry) => (
                  <Cell key={entry.siteId} fill={SITE_COLOR[entry.siteId]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardChrome>
    );
  }

  if (config.chartType === 'categoryShare') {
    const data = getCategoryShare(year);
    return (
      <CardChrome {...props} title={`카테고리별 공시항목 비중 (${year})`}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
              <XAxis dataKey="categoryName" tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e1e0d9', fontSize: 12 }} formatter={(v) => [`${v}건`, '공시항목 수']} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
                {data.map((entry) => (
                  <Cell key={entry.categoryId} fill={CATEGORY_COLOR[entry.categoryId] ?? CHART_INK.muted} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardChrome>
    );
  }

  // statusBreakdown
  const data = getStatusBreakdown(year);
  return (
    <CardChrome {...props} title={`검증 상태별 현황 (${year})`}>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_INK.grid} vertical={false} />
            <XAxis dataKey="statusName" tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={{ stroke: CHART_INK.axis }} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: CHART_INK.muted, fontSize: 12 }} axisLine={false} tickLine={false} width={32} />
            <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e1e0d9', fontSize: 12 }} formatter={(v) => [`${v}건`, '공시데이터 수']} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
              {data.map((entry) => (
                <Cell key={entry.statusId} fill={STATUS_COLOR[entry.statusName] ?? CHART_INK.muted} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardChrome>
  );
}
