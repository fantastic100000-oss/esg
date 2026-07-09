import { calculateEmissions } from './calculations';
import { SITES } from '../constants';
import type { EsgRecord, MonthKey, SiteId } from '../types';

export interface MonthTotals {
  electricityKwh: number;
  waterM3: number;
  wasteKg: number;
  scope1TCo2e: number;
  scope2TCo2e: number;
  totalTCo2e: number;
}

export function getSortedMonths(records: EsgRecord[]): MonthKey[] {
  return Array.from(new Set(records.map((r) => r.month))).sort();
}

export function getLatestMonth(records: EsgRecord[]): MonthKey | undefined {
  const months = getSortedMonths(records);
  return months[months.length - 1];
}

export function aggregateForMonth(records: EsgRecord[], month: MonthKey | undefined): MonthTotals {
  const monthRecords = records.filter((r) => r.month === month);
  return monthRecords.reduce<MonthTotals>(
    (acc, r) => {
      const e = calculateEmissions(r);
      return {
        electricityKwh: acc.electricityKwh + r.electricityKwh,
        waterM3: acc.waterM3 + r.waterM3,
        wasteKg: acc.wasteKg + r.wasteKg,
        scope1TCo2e: acc.scope1TCo2e + e.scope1TCo2e,
        scope2TCo2e: acc.scope2TCo2e + e.scope2TCo2e,
        totalTCo2e: acc.totalTCo2e + e.totalTCo2e,
      };
    },
    { electricityKwh: 0, waterM3: 0, wasteKg: 0, scope1TCo2e: 0, scope2TCo2e: 0, totalTCo2e: 0 },
  );
}

export interface SiteMonthValue {
  siteId: SiteId;
  month: MonthKey;
  totalTCo2e: number;
}

/** 사업장별 비교 차트용 - 특정 월의 사업장별 총 배출량 */
export function siteComparisonForMonth(records: EsgRecord[], month: MonthKey | undefined) {
  return SITES.map((site) => {
    const record = records.find((r) => r.siteId === site.id && r.month === month);
    const totalTCo2e = record ? calculateEmissions(record).totalTCo2e : 0;
    return { siteId: site.id, siteName: site.name, totalTCo2e };
  });
}

export type TrendMetric = 'totalTCo2e' | 'electricityKwh' | 'waterM3' | 'wasteKg';

/** 월별 추이 차트용 - 월 x 사업장 매트릭스 (recharts용 flat row) */
export function monthlyTrendData(records: EsgRecord[], metric: TrendMetric) {
  const months = getSortedMonths(records);
  return months.map((month) => {
    const row: Record<string, string | number> = { month };
    for (const site of SITES) {
      const record = records.find((r) => r.siteId === site.id && r.month === month);
      if (!record) {
        row[site.id] = 0;
        continue;
      }
      row[site.id] = metric === 'totalTCo2e' ? calculateEmissions(record).totalTCo2e : record[metric];
    }
    return row;
  });
}
