export type SiteId = 'hq' | 'ck' | 'logistics' | 'catering';

export interface Site {
  id: SiteId;
  name: string;
}

export type RecordStatus = 'draft' | 'in_review' | 'approved' | 'rejected';

export const RECORD_STATUS_LABEL: Record<RecordStatus, string> = {
  draft: '작성중',
  in_review: '검토중',
  approved: '승인완료',
  rejected: '반려',
};

/** yyyy-mm, e.g. "2026-06" */
export type MonthKey = string;

export interface EsgRecord {
  id: string;
  siteId: SiteId;
  month: MonthKey;
  /** 전력 사용량 (kWh) */
  electricityKwh: number;
  /** 도시가스 사용량 (m3) */
  cityGasM3: number;
  /** 차량연료 사용량 (L) */
  vehicleFuelL: number;
  /** 용수 사용량 (m3) */
  waterM3: number;
  /** 폐기물 발생량 (kg) */
  wasteKg: number;
  /** 증빙파일명 */
  evidenceFileName: string;
  status: RecordStatus;
  /** 반려 사유 */
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Emissions {
  scope1TCo2e: number;
  scope2TCo2e: number;
  totalTCo2e: number;
}

export interface ValidationFlags {
  /** 전월 대비 ±20% 이상 변동 필드 목록 */
  outlierFields: string[];
  /** 필수 항목 중 누락된 필드 */
  missingFields: string[];
  /** 증빙파일 미입력 여부 */
  missingEvidence: boolean;
}

export interface GriMappingItem {
  code: string;
  title: string;
  getValue: (records: EsgRecord[]) => string;
}
