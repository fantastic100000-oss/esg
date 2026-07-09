import {
  DEFAULT_CATEGORIES,
  DEFAULT_DEPARTMENTS,
  DEFAULT_DISCLOSURE_ITEM_DEFS,
  DEFAULT_DOCUMENT_TYPES,
  DEFAULT_SITES,
  DEFAULT_VERIFICATION_STATUSES,
  STORAGE_KEYS,
} from '../constants';
import { generateSampleData } from '../data/sampleData';
import {
  ALL_STORAGE_KEYS,
  assuranceRepository,
  categoryRepository,
  committeeRepository,
  dashboardConfigStore,
  departmentRepository,
  disclosureItemDefRepository,
  disclosureRepository,
  documentTypeRepository,
  evidenceRepository,
  fileRepository,
  folderRepository,
  griRepository,
  rawDataRepository,
  reportRepository,
  siteRepository,
  verificationStatusRepository,
} from '../repositories';
import { DEFAULT_DASHBOARD_CONFIG } from './defaultDashboardConfig';

function seedTaxonomies(): void {
  categoryRepository.replaceAll(DEFAULT_CATEGORIES);
  departmentRepository.replaceAll(DEFAULT_DEPARTMENTS);
  siteRepository.replaceAll(DEFAULT_SITES);
  documentTypeRepository.replaceAll(DEFAULT_DOCUMENT_TYPES);
  verificationStatusRepository.replaceAll(DEFAULT_VERIFICATION_STATUSES);
  disclosureItemDefRepository.replaceAll(DEFAULT_DISCLOSURE_ITEM_DEFS);
}

function seedGri(): void {
  griRepository.replaceAll(generateSampleData().gri);
}

function seedAll(): void {
  seedTaxonomies();
  const seed = generateSampleData();
  reportRepository.replaceAll(seed.reports);
  committeeRepository.replaceAll(seed.committees);
  folderRepository.replaceAll(seed.folders);
  fileRepository.replaceAll(seed.files);
  disclosureRepository.replaceAll(seed.disclosures);
  rawDataRepository.replaceAll(seed.rawData);
  evidenceRepository.replaceAll(seed.evidence);
  assuranceRepository.replaceAll(seed.assurance);
  griRepository.replaceAll(seed.gri);
  dashboardConfigStore.set(DEFAULT_DASHBOARD_CONFIG);
}

/** 최초 실행 시 1회만 샘플 데이터를 시딩한다. */
export function ensureSeedData(): void {
  if (localStorage.getItem(STORAGE_KEYS.seeded)) return;
  seedAll();
  localStorage.setItem(STORAGE_KEYS.seeded, 'true');
}

/** Settings > GRI 기준 샘플 데이터 초기화 */
export function resetGriStandards(): void {
  seedGri();
}

/** Settings > localStorage 데이터 초기화 (전체 초기화 후 샘플 데이터 재생성) */
export function resetAllData(): void {
  ALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(STORAGE_KEYS.seeded);
  seedAll();
  localStorage.setItem(STORAGE_KEYS.seeded, 'true');
}
