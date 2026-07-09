import { categoryRepository, disclosureRepository, rawDataRepository, siteRepository, verificationStatusRepository } from '../repositories';
import { DEFAULT_DISCLOSURE_ITEM_DEFS, METRIC_DEFS, SAMPLE_YEARS } from '../constants';
import type { DisclosureData } from '../types';

const VERIFIED_STATUS_ID = 'status-verified';
const UNVERIFIED_STATUS_ID = 'status-unverified';

function disclosuresForYear(year: number): DisclosureData[] {
  return disclosureRepository.getAll().filter((d) => d.year === year);
}

function findItemDisclosure(metricKey: string, year: number): DisclosureData | undefined {
  return disclosuresForYear(year).find((d) => d.itemDefId === metricKey);
}

export function isItemMetric(metricKey: string): boolean {
  return DEFAULT_DISCLOSURE_ITEM_DEFS.some((def) => def.id === metricKey);
}

export function getMetricLabel(metricKey: string): string {
  return METRIC_DEFS.find((m) => m.key === metricKey)?.label ?? metricKey;
}

export function getMetricUnit(metricKey: string): string {
  return METRIC_DEFS.find((m) => m.key === metricKey)?.unit ?? '';
}

/** 카드용 단일 값 계산 (KPI) */
export function getMetricValue(metricKey: string, year: number): number {
  if (isItemMetric(metricKey)) {
    return findItemDisclosure(metricKey, year)?.value ?? 0;
  }
  const disclosures = disclosuresForYear(year);

  if (metricKey === 'gri-mapping-rate') {
    if (disclosures.length === 0) return 0;
    const mapped = disclosures.filter((d) => d.griCodes.length > 0).length;
    return Math.round((mapped / disclosures.length) * 1000) / 10;
  }
  if (metricKey === 'verified-count') {
    return disclosures.filter((d) => d.status === VERIFIED_STATUS_ID).length;
  }
  if (metricKey === 'unreviewed-count') {
    return disclosures.filter((d) => d.status === UNVERIFIED_STATUS_ID).length;
  }
  return 0;
}

/** 연도별 추이 */
export function getYearTrend(metricKey: string): { year: number; value: number }[] {
  return SAMPLE_YEARS.map((year) => ({ year, value: getMetricValue(metricKey, year) }));
}

/** 사업장별 비교 (Raw Data 기준 - 지표 metric에 해당하는 공시데이터의 사업장별 환산값 합계) */
export function getSiteComparison(metricKey: string, year: number): { siteId: string; siteName: string; value: number }[] {
  const disclosure = findItemDisclosure(metricKey, year);
  const sites = siteRepository.getAll();
  if (!disclosure) return sites.map((s) => ({ siteId: s.id, siteName: s.name, value: 0 }));

  const rows = rawDataRepository.getAll().filter((r) => r.disclosureId === disclosure.id);
  return sites.map((site) => ({
    siteId: site.id,
    siteName: site.name,
    value: rows.filter((r) => r.siteId === site.id).reduce((sum, r) => sum + r.convertedValue, 0),
  }));
}

/** 카테고리별 비중 (해당 연도 공시데이터 건수 기준) */
export function getCategoryShare(year: number): { categoryId: string; categoryName: string; count: number }[] {
  const disclosures = disclosuresForYear(year);
  return categoryRepository.getAll().map((cat) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    count: disclosures.filter((d) => d.categoryId === cat.id).length,
  }));
}

/** 상태별 현황 (검증상태 건수) */
export function getStatusBreakdown(year: number): { statusId: string; statusName: string; count: number }[] {
  const disclosures = disclosuresForYear(year);
  return verificationStatusRepository.getAll().map((status) => ({
    statusId: status.id,
    statusName: status.name,
    count: disclosures.filter((d) => d.status === status.id).length,
  }));
}
