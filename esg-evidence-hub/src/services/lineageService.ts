import {
  assuranceRepository,
  disclosureRepository,
  evidenceRepository,
  fileRepository,
  folderRepository,
  reportRepository,
} from '../repositories';
import { getRawDataForDisclosure } from './disclosureService';
import type { AssuranceReport, DisclosureData, EvidenceDocument, Folder, RawDataRow, SustainabilityReport } from '../types';

export interface DisclosureLineage {
  disclosure: DisclosureData;
  reports: SustainabilityReport[];
  griCodes: string[];
  rawRows: RawDataRow[];
  evidences: EvidenceDocument[];
  assurances: AssuranceReport[];
}

/**
 * 공시 데이터 기준 Data Lineage 조립.
 * 예: 2026 지속가능경영보고서 → GRI 305-2 → Scope2 배출량 → 전력 사용량 Raw Data → 증빙데이터 → 검증보고서
 */
export function getDisclosureLineage(disclosureId: string): DisclosureLineage | undefined {
  const disclosure = disclosureRepository.getById(disclosureId);
  if (!disclosure) return undefined;

  const rawRows = getRawDataForDisclosure(disclosureId);
  const evidences = evidenceRepository.getAll().filter((e) => e.disclosureId === disclosureId);
  const assurances = assuranceRepository.getAll().filter((a) => a.relatedDisclosureIds.includes(disclosureId));

  const reportIdsFromAssurance = assurances.flatMap((a) => a.relatedReportIds);
  const reportIdsFromFiles = fileRepository
    .getAll()
    .filter((f) => f.relatedDisclosureIds.includes(disclosureId))
    .map((f) => folderRepository.getById(f.folderId))
    .filter((f): f is Folder => !!f && f.ownerType === 'report')
    .map((f) => f.ownerId);

  const reportIds = Array.from(new Set([...reportIdsFromAssurance, ...reportIdsFromFiles]));
  const reports = reportIds
    .map((id) => reportRepository.getById(id))
    .filter((r): r is SustainabilityReport => !!r)
    .sort((a, b) => b.year - a.year);

  return { disclosure, reports, griCodes: disclosure.griCodes, rawRows, evidences, assurances };
}
