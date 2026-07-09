import type { Site, SiteId } from '../types';

export const SITES: Site[] = [
  { id: 'hq', name: '본사' },
  { id: 'ck', name: 'CK' },
  { id: 'logistics', name: '물류센터' },
  { id: 'catering', name: '급식사업장' },
];

export const SITE_NAME: Record<SiteId, string> = SITES.reduce(
  (acc, s) => ({ ...acc, [s.id]: s.name }),
  {} as Record<SiteId, string>,
);

/**
 * 예시 배출계수 (임의값, 실제 국가 고시계수 아님 - 데모/프로토타입용).
 * 단위: tCO2e / 사용단위
 */
export const EMISSION_FACTORS = {
  /** 전력 (Scope 2), tCO2e / kWh */
  electricity: 0.0004567,
  /** 도시가스 (Scope 1), tCO2e / m3 */
  cityGas: 0.002176,
  /** 차량연료 (Scope 1), tCO2e / L */
  vehicleFuel: 0.002582,
};

/** 전월 대비 이상치 판단 임계값 (비율) */
export const OUTLIER_THRESHOLD = 0.2;

export const STORAGE_KEYS = {
  records: 'esg-platform:records',
  seeded: 'esg-platform:seeded',
};

export const RECENT_MONTHS_COUNT = 6;
