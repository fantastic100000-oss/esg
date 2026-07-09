import type { TaxonomyItem, MetricDef } from '../types';

export const STORAGE_KEYS = {
  reports: 'esg-hub:reports',
  committees: 'esg-hub:committees',
  folders: 'esg-hub:folders',
  files: 'esg-hub:files',
  disclosures: 'esg-hub:disclosures',
  rawData: 'esg-hub:rawData',
  evidence: 'esg-hub:evidence',
  assurance: 'esg-hub:assurance',
  gri: 'esg-hub:gri',
  dashboardConfig: 'esg-hub:dashboardConfig',
  categories: 'esg-hub:categories',
  departments: 'esg-hub:departments',
  sites: 'esg-hub:sites',
  documentTypes: 'esg-hub:documentTypes',
  verificationStatuses: 'esg-hub:verificationStatuses',
  disclosureItemDefs: 'esg-hub:disclosureItemDefs',
  seeded: 'esg-hub:seeded',
} as const;

export const SAMPLE_YEARS = [2024, 2025, 2026];

export const DEFAULT_CATEGORIES: TaxonomyItem[] = [
  { id: 'environment', name: '환경' },
  { id: 'social', name: '사회' },
  { id: 'governance', name: '지배구조' },
];

export const DEFAULT_DEPARTMENTS: TaxonomyItem[] = [
  { id: 'dept-esg', name: 'ESG전략팀' },
  { id: 'dept-safety', name: '환경안전팀' },
  { id: 'dept-hr', name: '인사팀' },
  { id: 'dept-ga', name: '총무팀' },
  { id: 'dept-fin', name: '재무팀' },
];

export const DEFAULT_SITES: TaxonomyItem[] = [
  { id: 'site-hq', name: '본사' },
  { id: 'site-ck', name: 'CK' },
  { id: 'site-logistics', name: '물류센터' },
  { id: 'site-catering', name: '급식사업장' },
];

export const DEFAULT_DOCUMENT_TYPES: TaxonomyItem[] = [
  '계약서', '제안서', '검증자료', '법무검토', '참고자료', '기타',
  '전기사용량 고지서', '수도 사용량 고지서', '폐기물 처리 확인서',
  '교육 참석자 명단', '안전보건 재해 집계표', '사회공헌 지출내역',
  '부서 제출자료', 'ERP 캡처', '내부 결재문서',
].map((name, i) => ({ id: `doctype-${i + 1}`, name }));

export const DEFAULT_VERIFICATION_STATUSES: TaxonomyItem[] = [
  { id: 'status-unverified', name: '미검증' },
  { id: 'status-reviewing', name: '검토중' },
  { id: 'status-verified', name: '검증완료' },
  { id: 'status-supplement', name: '보완요청' },
];

export const REPORT_DEFAULT_FOLDERS = [
  '최종본', '초안', '부서확인자료', '계약서', '제안서', '검증자료', '법무검토', '참고자료', '기타',
];

export const COMMITTEE_DEFAULT_FOLDERS = [
  '회의자료', '안건자료', '의사록', '계약서', '제안서', '참고자료', '기타',
];

export interface DisclosureItemDef {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  defaultGriCodes: string[];
  calculationBasis: string;
  calculationFormula: string;
}

export const DEFAULT_DISCLOSURE_ITEM_DEFS: DisclosureItemDef[] = [
  {
    id: 'item-scope1',
    name: 'Scope1 배출량',
    categoryId: 'environment',
    unit: 'tCO2e',
    defaultGriCodes: ['GRI 305-1'],
    calculationBasis: '온실가스 배출권거래제 배출량 산정지침',
    calculationFormula: 'Σ(도시가스·차량연료 등 활동량 × 배출계수)',
  },
  {
    id: 'item-scope2',
    name: 'Scope2 배출량',
    categoryId: 'environment',
    unit: 'tCO2e',
    defaultGriCodes: ['GRI 305-2'],
    calculationBasis: '온실가스 배출권거래제 배출량 산정지침',
    calculationFormula: '전력 사용량 × 전력 배출계수',
  },
  {
    id: 'item-electricity',
    name: '전력 사용량',
    categoryId: 'environment',
    unit: 'kWh',
    defaultGriCodes: ['GRI 302-1'],
    calculationBasis: '사업장별 전력 고지서 합산',
    calculationFormula: 'Σ 월별 사업장 전력 사용량',
  },
  {
    id: 'item-water',
    name: '용수 사용량',
    categoryId: 'environment',
    unit: 'm³',
    defaultGriCodes: ['GRI 303-3'],
    calculationBasis: '사업장별 수도 고지서 합산',
    calculationFormula: 'Σ 월별 사업장 취수량',
  },
  {
    id: 'item-waste',
    name: '폐기물 발생량',
    categoryId: 'environment',
    unit: 'kg',
    defaultGriCodes: ['GRI 306-3'],
    calculationBasis: '폐기물 처리 확인서 합산',
    calculationFormula: 'Σ 월별 폐기물 발생량',
  },
  {
    id: 'item-headcount',
    name: '임직원 수',
    categoryId: 'social',
    unit: '명',
    defaultGriCodes: [],
    calculationBasis: '기준일 인사시스템 재직자 집계',
    calculationFormula: '기준일 재직 인원 합계',
  },
  {
    id: 'item-training',
    name: '교육시간',
    categoryId: 'social',
    unit: '시간',
    defaultGriCodes: ['GRI 404-1'],
    calculationBasis: '교육 참석자 명단 합산',
    calculationFormula: 'Σ 임직원별 교육 이수 시간',
  },
  {
    id: 'item-safety',
    name: '산업재해 건수',
    categoryId: 'social',
    unit: '건',
    defaultGriCodes: ['GRI 403-9'],
    calculationBasis: '안전보건 재해 집계표 합산',
    calculationFormula: 'Σ 산업재해 발생 건수',
  },
  {
    id: 'item-csr',
    name: '사회공헌비용',
    categoryId: 'social',
    unit: '천원',
    defaultGriCodes: [],
    calculationBasis: '사회공헌 지출내역 합산',
    calculationFormula: 'Σ 사회공헌 지출액',
  },
];

export interface GriSeed {
  code: string;
  title: string;
  description: string;
  requiredData: string;
}

export const DEFAULT_GRI_STANDARDS: GriSeed[] = [
  {
    code: 'GRI 302-1',
    title: '조직 내 에너지 소비량',
    description: '조직이 소비한 연료 및 전력 등 에너지 사용량을 공시한다.',
    requiredData: '전력·연료 등 에너지원별 사용량 데이터',
  },
  {
    code: 'GRI 303-3',
    title: '용수 취수량',
    description: '수원별 취수량을 공시한다.',
    requiredData: '사업장별 용수 사용량(취수량) 데이터',
  },
  {
    code: 'GRI 305-1',
    title: '직접 온실가스 배출량 (Scope 1)',
    description: '조직이 직접 배출하는 온실가스 배출량을 공시한다.',
    requiredData: '도시가스·차량연료 등 사용량 및 배출계수',
  },
  {
    code: 'GRI 305-2',
    title: '간접 온실가스 배출량 (Scope 2)',
    description: '조직이 구매한 전력 사용에 따른 간접 배출량을 공시한다.',
    requiredData: '전력 사용량 및 전력 배출계수',
  },
  {
    code: 'GRI 306-3',
    title: '폐기물 발생',
    description: '발생한 폐기물의 총량과 유형을 공시한다.',
    requiredData: '폐기물 처리 확인서 및 발생량 데이터',
  },
  {
    code: 'GRI 403-9',
    title: '업무 관련 상해',
    description: '업무 관련 상해 건수 및 유형을 공시한다.',
    requiredData: '안전보건 재해 집계표',
  },
  {
    code: 'GRI 404-1',
    title: '임직원 1인당 평균 교육시간',
    description: '임직원 1인당 평균 교육시간을 성별/직급별로 공시한다.',
    requiredData: '교육 참석자 명단 및 교육시간 데이터',
  },
];

export const METRIC_DEFS: MetricDef[] = [
  { key: 'item-scope1', label: 'Scope1 배출량', unit: 'tCO2e' },
  { key: 'item-scope2', label: 'Scope2 배출량', unit: 'tCO2e' },
  { key: 'item-electricity', label: '전력 사용량', unit: 'kWh' },
  { key: 'item-water', label: '용수 사용량', unit: 'm³' },
  { key: 'item-waste', label: '폐기물 발생량', unit: 'kg' },
  { key: 'item-training', label: '교육시간', unit: '시간' },
  { key: 'item-safety', label: '산업재해 건수', unit: '건' },
  { key: 'item-csr', label: '사회공헌비용', unit: '천원' },
  { key: 'gri-mapping-rate', label: 'GRI 매핑 완료율', unit: '%' },
  { key: 'verified-count', label: '검증 완료 데이터 수', unit: '건' },
  { key: 'unreviewed-count', label: '미검토 데이터 수', unit: '건' },
];
