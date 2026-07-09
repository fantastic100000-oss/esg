import { disclosureRepository, evidenceRepository, fileRepository, rawDataRepository } from '../repositories';
import type { DisclosureData } from '../types';

export interface GriMappingInfo {
  code: string;
  relatedDisclosures: DisclosureData[];
  relatedRawDataCount: number;
  relatedEvidenceCount: number;
  /** 보고서(지속가능경영보고서) 폴더의 파일에 해당 GRI 코드 또는 관련 공시데이터가 첨부되어 있는지 여부 */
  reportReferenced: boolean;
}

export function getGriMappingInfo(code: string): GriMappingInfo {
  const relatedDisclosures = disclosureRepository.getAll().filter((d) => d.griCodes.includes(code));
  const disclosureIds = new Set(relatedDisclosures.map((d) => d.id));

  const relatedRawDataCount = rawDataRepository.getAll().filter((r) => disclosureIds.has(r.disclosureId)).length;
  const relatedEvidenceCount = evidenceRepository.getAll().filter((e) => disclosureIds.has(e.disclosureId)).length;
  const reportReferenced = fileRepository
    .getAll()
    .some((f) => f.relatedGriCodes.includes(code) || f.relatedDisclosureIds.some((id) => disclosureIds.has(id)));

  return { code, relatedDisclosures, relatedRawDataCount, relatedEvidenceCount, reportReferenced };
}

/** 특정 공시데이터가 가진 GRI 코드들의 매핑 정보 (ESG 데이터 상세 > GRI 매핑 탭에서 사용) */
export function getGriMappingForDisclosure(disclosure: DisclosureData): GriMappingInfo[] {
  return disclosure.griCodes.map(getGriMappingInfo);
}
