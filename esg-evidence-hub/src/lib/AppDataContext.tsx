import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ensureSeedData, resetAllData, resetGriStandards } from './bootstrap';
import { DEFAULT_DASHBOARD_CONFIG } from './defaultDashboardConfig';
import {
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

interface AppData {
  reports: SustainabilityReport[];
  committees: ESGCommittee[];
  folders: Folder[];
  files: FileMetadata[];
  disclosures: DisclosureData[];
  rawData: RawDataRow[];
  evidence: EvidenceDocument[];
  assurance: AssuranceReport[];
  gri: GRIStandard[];
  categories: TaxonomyItem[];
  departments: TaxonomyItem[];
  sites: TaxonomyItem[];
  documentTypes: TaxonomyItem[];
  verificationStatuses: TaxonomyItem[];
  disclosureItemDefs: DisclosureItemDef[];
  dashboardConfig: DashboardConfig;
}

interface AppDataContextValue extends AppData {
  refresh: () => void;
  resetAll: () => void;
  resetGri: () => void;
}

function loadAll(): AppData {
  return {
    reports: reportRepository.getAll(),
    committees: committeeRepository.getAll(),
    folders: folderRepository.getAll(),
    files: fileRepository.getAll(),
    disclosures: disclosureRepository.getAll(),
    rawData: rawDataRepository.getAll(),
    evidence: evidenceRepository.getAll(),
    assurance: assuranceRepository.getAll(),
    gri: griRepository.getAll(),
    categories: categoryRepository.getAll(),
    departments: departmentRepository.getAll(),
    sites: siteRepository.getAll(),
    documentTypes: documentTypeRepository.getAll(),
    verificationStatuses: verificationStatusRepository.getAll(),
    disclosureItemDefs: disclosureItemDefRepository.getAll(),
    dashboardConfig: dashboardConfigStore.get() ?? DEFAULT_DASHBOARD_CONFIG,
  };
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    ensureSeedData();
    setData(loadAll());
  }, []);

  const refresh = useCallback(() => setData(loadAll()), []);

  const resetAll = useCallback(() => {
    resetAllData();
    refresh();
  }, [refresh]);

  const resetGri = useCallback(() => {
    resetGriStandards();
    refresh();
  }, [refresh]);

  const value = useMemo<AppDataContextValue | null>(() => (data ? { ...data, refresh, resetAll, resetGri } : null), [data, refresh, resetAll, resetGri]);

  if (!value) return null;

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
