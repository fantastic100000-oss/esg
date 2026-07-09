import { STORAGE_KEYS } from '../constants';
import { createLocalStorageRepository, createLocalStorageSingleton } from './localStorageRepository';
import type {
  AssuranceReport,
  DashboardConfig,
  DisclosureData,
  ESGCommittee,
  EvidenceDocument,
  FileMetadata,
  Folder,
  GRIStandard,
  RawDataRow,
  SustainabilityReport,
  TaxonomyItem,
} from '../types';
import type { DisclosureItemDef } from '../constants';

export const reportRepository = createLocalStorageRepository<SustainabilityReport>(STORAGE_KEYS.reports);
export const committeeRepository = createLocalStorageRepository<ESGCommittee>(STORAGE_KEYS.committees);
export const folderRepository = createLocalStorageRepository<Folder>(STORAGE_KEYS.folders);
export const fileRepository = createLocalStorageRepository<FileMetadata>(STORAGE_KEYS.files);
export const disclosureRepository = createLocalStorageRepository<DisclosureData>(STORAGE_KEYS.disclosures);
export const rawDataRepository = createLocalStorageRepository<RawDataRow>(STORAGE_KEYS.rawData);
export const evidenceRepository = createLocalStorageRepository<EvidenceDocument>(STORAGE_KEYS.evidence);
export const assuranceRepository = createLocalStorageRepository<AssuranceReport>(STORAGE_KEYS.assurance);
export const griRepository = createLocalStorageRepository<GRIStandard>(STORAGE_KEYS.gri);

export const categoryRepository = createLocalStorageRepository<TaxonomyItem>(STORAGE_KEYS.categories);
export const departmentRepository = createLocalStorageRepository<TaxonomyItem>(STORAGE_KEYS.departments);
export const siteRepository = createLocalStorageRepository<TaxonomyItem>(STORAGE_KEYS.sites);
export const documentTypeRepository = createLocalStorageRepository<TaxonomyItem>(STORAGE_KEYS.documentTypes);
export const verificationStatusRepository = createLocalStorageRepository<TaxonomyItem>(STORAGE_KEYS.verificationStatuses);
export const disclosureItemDefRepository = createLocalStorageRepository<DisclosureItemDef>(STORAGE_KEYS.disclosureItemDefs);

export const dashboardConfigStore = createLocalStorageSingleton<DashboardConfig>(STORAGE_KEYS.dashboardConfig);

export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS);
