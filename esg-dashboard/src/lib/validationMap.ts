import { validateRecord } from './calculations';
import { getRecentMonths } from '../data/sampleData';
import { SITES } from '../constants';
import type { EsgRecord, MonthKey, SiteId, ValidationFlags } from '../types';

/** 사업장별로 월 순서대로 정렬 후, 직전 레코드와 비교해 검증 플래그를 계산한다. */
export function buildValidationMap(records: EsgRecord[]): Map<string, ValidationFlags> {
  const map = new Map<string, ValidationFlags>();

  for (const site of SITES) {
    const siteRecords = records
      .filter((r) => r.siteId === site.id)
      .sort((a, b) => a.month.localeCompare(b.month));

    siteRecords.forEach((record, idx) => {
      const previous = idx > 0 ? siteRecords[idx - 1] : undefined;
      map.set(record.id, validateRecord(record, previous));
    });
  }

  return map;
}

export interface MissingCombo {
  siteId: SiteId;
  siteName: string;
  month: MonthKey;
}

/** 최근 N개월 x 사업장 조합 중 레코드 자체가 존재하지 않는 "누락 데이터" 목록 */
export function findMissingCombos(records: EsgRecord[]): MissingCombo[] {
  const months = getRecentMonths();
  const missing: MissingCombo[] = [];

  for (const month of months) {
    for (const site of SITES) {
      const exists = records.some((r) => r.siteId === site.id && r.month === month);
      if (!exists) {
        missing.push({ siteId: site.id, siteName: site.name, month });
      }
    }
  }

  return missing;
}
