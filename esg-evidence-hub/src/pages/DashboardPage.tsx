import { useState } from 'react';
import { useAppData } from '../lib/AppDataContext';
import { dashboardConfigStore } from '../repositories';
import { generateId } from '../lib/id';
import { SAMPLE_YEARS } from '../constants';
import { DashboardCard } from '../components/dashboard/DashboardCard';
import { AddCardModal } from '../components/dashboard/AddCardModal';
import type { ChartType, DashboardCardConfig } from '../types';

export function DashboardPage() {
  const { dashboardConfig, refresh } = useAppData();
  const [addOpen, setAddOpen] = useState(false);

  function persist(cards: DashboardCardConfig[], selectedYear = dashboardConfig.selectedYear) {
    dashboardConfigStore.set({ selectedYear, cards });
    refresh();
  }

  function handleYearChange(year: number) {
    persist(dashboardConfig.cards, year);
  }

  function handleAdd(metricKey: string, chartType: ChartType) {
    const newCard: DashboardCardConfig = {
      id: generateId('card'),
      metricKey,
      chartType,
      order: dashboardConfig.cards.length,
    };
    persist([...dashboardConfig.cards, newCard]);
  }

  function handleRemove(cardId: string) {
    persist(dashboardConfig.cards.filter((c) => c.id !== cardId).map((c, idx) => ({ ...c, order: idx })));
  }

  function handleChangeChartType(cardId: string, chartType: ChartType) {
    persist(dashboardConfig.cards.map((c) => (c.id === cardId ? { ...c, chartType } : c)));
  }

  function handleMove(cardId: string, direction: -1 | 1) {
    const sorted = [...dashboardConfig.cards].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((c) => c.id === cardId);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    [sorted[idx], sorted[targetIdx]] = [sorted[targetIdx], sorted[idx]];
    persist(sorted.map((c, i) => ({ ...c, order: i })));
  }

  const sortedCards = [...dashboardConfig.cards].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-slate-600">연도</span>
          <select
            value={dashboardConfig.selectedYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {SAMPLE_YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          + 카드 추가
        </button>
      </div>

      {sortedCards.length === 0 && (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-400">
          표시할 카드가 없습니다. "카드 추가" 버튼으로 대시보드를 구성해보세요.
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {sortedCards.map((card, idx) => (
          <DashboardCard
            key={card.id}
            config={card}
            year={dashboardConfig.selectedYear}
            onRemove={() => handleRemove(card.id)}
            onChangeChartType={(chartType) => handleChangeChartType(card.id, chartType)}
            onMoveUp={() => handleMove(card.id, -1)}
            onMoveDown={() => handleMove(card.id, 1)}
            isFirst={idx === 0}
            isLast={idx === sortedCards.length - 1}
          />
        ))}
      </div>

      <AddCardModal open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </div>
  );
}
