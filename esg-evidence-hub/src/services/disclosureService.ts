import { disclosureRepository, rawDataRepository } from '../repositories';
import type { DisclosureData, RawDataRow } from '../types';

/** 공시 데이터에 속한 Raw Data 전체 조회 */
export function getRawDataForDisclosure(disclosureId: string): RawDataRow[] {
  return rawDataRepository.getAll().filter((r) => r.disclosureId === disclosureId);
}

/**
 * Raw Data의 환산값 합계로 공시값을 재계산해 저장한다.
 * Raw Data 행 추가/수정/삭제 시 반드시 호출되어야 한다.
 */
export function recalculateDisclosureValue(disclosureId: string): DisclosureData | undefined {
  const disclosure = disclosureRepository.getById(disclosureId);
  if (!disclosure) return undefined;

  const rows = getRawDataForDisclosure(disclosureId);
  const value = rows.reduce((sum, row) => sum + (Number(row.convertedValue) || 0), 0);

  const updated: DisclosureData = { ...disclosure, value, updatedAt: new Date().toISOString() };
  disclosureRepository.update(updated);
  return updated;
}

export function saveRawDataRow(row: RawDataRow): void {
  rawDataRepository.update(row);
  recalculateDisclosureValue(row.disclosureId);
}

export function deleteRawDataRow(rowId: string): void {
  const row = rawDataRepository.getById(rowId);
  rawDataRepository.remove(rowId);
  if (row) recalculateDisclosureValue(row.disclosureId);
}

export function replaceRawDataRows(disclosureId: string, rows: RawDataRow[]): void {
  const others = rawDataRepository.getAll().filter((r) => r.disclosureId !== disclosureId);
  rawDataRepository.replaceAll([...others, ...rows]);
  recalculateDisclosureValue(disclosureId);
}
