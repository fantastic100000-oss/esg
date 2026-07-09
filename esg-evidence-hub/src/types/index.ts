/**
 * 핵심 데이터 모델
 *
 * 관계 요약:
 *  SustainabilityReport --(폴더/파일)--> FileMetadata
 *  ESGCommittee --(폴더/파일, 안건)--> FileMetadata / DisclosureData
 *  DisclosureData --(1:N)--> RawDataRow
 *  DisclosureData --(1:N)--> EvidenceDocument --(N:M)--> RawDataRow
 *  DisclosureData --(N:M)--> GRIStandard (griCodes)
 *  DisclosureData --(1:N)--> AssuranceReport (증빙데이터와는 별도 보관)
 *  AssuranceReport --(N:M)--> SustainabilityReport, CommitteeAgendaItem
 */

export type ID = string;

// ---------------------------------------------------------------------------
// 공용 타입
// ---------------------------------------------------------------------------

/** Settings 화면에서 관리하는 단순 택소노미 항목 (카테고리/부서/사업장/문서유형/검증상태값) */
export interface TaxonomyItem {
  id: ID;
  name: string;
}

export type FolderOwnerType = 'report' | 'committee';

export interface Folder {
  id: ID;
  ownerType: FolderOwnerType;
  ownerId: ID;
  parentFolderId: ID | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** 보고서/위원회 폴더에 업로드되는 파일의 메타데이터 (실제 파일은 저장하지 않음) */
export interface FileMetadata {
  id: ID;
  folderId: ID;
  fileName: string;
  extension: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  description: string;
  documentType: string;
  relatedDisclosureIds: ID[];
  relatedGriCodes: string[];
}

// ---------------------------------------------------------------------------
// 지속가능경영보고서
// ---------------------------------------------------------------------------

export interface SustainabilityReport {
  id: ID;
  year: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// ESG위원회
// ---------------------------------------------------------------------------

export interface CommitteeAgendaItem {
  id: ID;
  committeeId: ID;
  title: string;
  relatedDisclosureIds: ID[];
}

export interface ESGCommittee {
  id: ID;
  year: number;
  round: number;
  name: string;
  date: string;
  description: string;
  agendaItems: CommitteeAgendaItem[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// ESG 데이터: 공시데이터 / Raw Data / 증빙데이터 / 검증보고서
// ---------------------------------------------------------------------------

export interface DisclosureData {
  id: ID;
  /** 공시 항목 정의(DisclosureItemDef) id - 연도별로 동일 지표를 그룹핑하는 데 사용 */
  itemDefId: ID;
  year: number;
  categoryId: ID;
  name: string;
  value: number;
  unit: string;
  calculationBasis: string;
  calculationFormula: string;
  departmentId: ID;
  /** 검증 상태값 taxonomy id (Settings > 검증 상태값) */
  status: ID;
  griCodes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RawDataRow {
  id: ID;
  disclosureId: ID;
  siteId: ID;
  month: string;
  dataItem: string;
  sourceValue: number;
  unit: string;
  convertedValue: number;
  inputBy: string;
  updatedAt: string;
  note: string;
}

/** 증빙데이터: Raw Data의 근거자료. 검증보고서와는 별도 객체로 구분한다. */
export interface EvidenceDocument {
  id: ID;
  disclosureId: ID;
  relatedRawDataIds: ID[];
  documentType: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  description: string;
}

/** 검증보고서: 증빙데이터와 별도로 보관되는 객체 (온실가스 검증보고서, 제3자 검증의견서 등) */
export interface AssuranceReport {
  id: ID;
  relatedDisclosureIds: ID[];
  relatedReportIds: ID[];
  relatedCommitteeAgendaIds: ID[];
  documentType: string;
  fileName: string;
  extension: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  description: string;
}

// ---------------------------------------------------------------------------
// GRI Standards
// ---------------------------------------------------------------------------

export interface GRIStandard {
  id: ID;
  code: string;
  title: string;
  description: string;
  requiredData: string;
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export type ChartType = 'kpi' | 'yearTrend' | 'siteCompare' | 'categoryShare' | 'statusBreakdown';

export interface DashboardCardConfig {
  id: ID;
  metricKey: string;
  chartType: ChartType;
  order: number;
}

export interface DashboardConfig {
  selectedYear: number;
  cards: DashboardCardConfig[];
}

export interface MetricDef {
  key: string;
  label: string;
  unit: string;
}
