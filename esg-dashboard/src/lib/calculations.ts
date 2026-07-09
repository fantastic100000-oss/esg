import { EMISSION_FACTORS, OUTLIER_THRESHOLD } from '../constants';
import type { EsgRecord, Emissions, ValidationFlags } from '../types';

export function calculateEmissions(record: EsgRecord): Emissions {
  const scope1TCo2e =
    record.cityGasM3 * EMISSION_FACTORS.cityGas +
    record.vehicleFuelL * EMISSION_FACTORS.vehicleFuel;
  const scope2TCo2e = record.electricityKwh * EMISSION_FACTORS.electricity;

  return {
    scope1TCo2e,
    scope2TCo2e,
    totalTCo2e: scope1TCo2e + scope2TCo2e,
  };
}

/** yyyy-mm 문자열을 1개월 전으로 이동 */
export function previousMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** (현재값 - 이전값) / 이전값, 이전값이 0이면 undefined */
export function growthRate(current: number, previous: number): number | undefined {
  if (!previous) return undefined;
  return (current - previous) / previous;
}

const NUMERIC_FIELDS: (keyof EsgRecord)[] = [
  'electricityKwh',
  'cityGasM3',
  'vehicleFuelL',
  'waterM3',
  'wasteKg',
];

const FIELD_LABEL: Record<string, string> = {
  electricityKwh: '전력 사용량',
  cityGasM3: '도시가스 사용량',
  vehicleFuelL: '차량연료 사용량',
  waterM3: '용수 사용량',
  wasteKg: '폐기물 발생량',
};

export { FIELD_LABEL };

/**
 * 동일 사업장의 전월 레코드와 비교해 이상치/누락/증빙 여부를 검증한다.
 */
export function validateRecord(
  record: EsgRecord,
  previousRecord: EsgRecord | undefined,
): ValidationFlags {
  const outlierFields: string[] = [];
  const missingFields: string[] = [];

  for (const field of NUMERIC_FIELDS) {
    const value = record[field] as number;
    if (value === undefined || value === null || Number.isNaN(value)) {
      missingFields.push(field);
      continue;
    }
    if (previousRecord) {
      const prevValue = previousRecord[field] as number;
      const rate = growthRate(value, prevValue);
      if (rate !== undefined && Math.abs(rate) >= OUTLIER_THRESHOLD) {
        outlierFields.push(field);
      }
    }
  }

  return {
    outlierFields,
    missingFields,
    missingEvidence: !record.evidenceFileName || record.evidenceFileName.trim() === '',
  };
}
