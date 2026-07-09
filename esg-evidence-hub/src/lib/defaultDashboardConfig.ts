import type { DashboardConfig } from '../types';

export const DEFAULT_DASHBOARD_CONFIG: DashboardConfig = {
  selectedYear: 2026,
  cards: [
    { id: 'card-1', metricKey: 'item-scope1', chartType: 'kpi', order: 0 },
    { id: 'card-2', metricKey: 'item-scope2', chartType: 'kpi', order: 1 },
    { id: 'card-3', metricKey: 'item-electricity', chartType: 'kpi', order: 2 },
    { id: 'card-4', metricKey: 'item-water', chartType: 'kpi', order: 3 },
    { id: 'card-5', metricKey: 'item-waste', chartType: 'kpi', order: 4 },
    { id: 'card-6', metricKey: 'gri-mapping-rate', chartType: 'kpi', order: 5 },
    { id: 'card-7', metricKey: 'item-scope1', chartType: 'yearTrend', order: 6 },
    { id: 'card-8', metricKey: 'item-electricity', chartType: 'siteCompare', order: 7 },
    { id: 'card-9', metricKey: 'item-scope1', chartType: 'categoryShare', order: 8 },
    { id: 'card-10', metricKey: 'item-scope1', chartType: 'statusBreakdown', order: 9 },
  ],
};
