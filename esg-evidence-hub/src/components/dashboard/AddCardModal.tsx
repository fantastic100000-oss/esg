import { useState } from 'react';
import { Modal } from '../common/Modal';
import { METRIC_DEFS } from '../../constants';
import type { ChartType } from '../../types';

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'kpi', label: '카드(단일값)' },
  { value: 'yearTrend', label: '연도별 추이' },
  { value: 'siteCompare', label: '사업장별 비교' },
  { value: 'categoryShare', label: '카테고리별 비중' },
  { value: 'statusBreakdown', label: '상태별 현황' },
];

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (metricKey: string, chartType: ChartType) => void;
}

export function AddCardModal({ open, onClose, onAdd }: AddCardModalProps) {
  const [metricKey, setMetricKey] = useState(METRIC_DEFS[0].key);
  const [chartType, setChartType] = useState<ChartType>('kpi');

  return (
    <Modal open={open} onClose={onClose} title="카드 추가">
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">표시할 ESG 항목</span>
          <select
            value={metricKey}
            onChange={(e) => setMetricKey(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {METRIC_DEFS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">차트 유형</span>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {CHART_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            onAdd(metricKey, chartType);
            onClose();
          }}
          className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          카드 추가
        </button>
      </div>
    </Modal>
  );
}
