import {
  assuranceRepository,
  committeeRepository,
  disclosureRepository,
  evidenceRepository,
  folderRepository,
  griRepository,
  rawDataRepository,
  reportRepository,
} from '../repositories';

export type SearchResultType =
  | 'report'
  | 'committee'
  | 'disclosure'
  | 'rawData'
  | 'evidence'
  | 'assurance'
  | 'gri'
  | 'folder';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  label: string;
  sublabel: string;
  path: string;
}

function includesQuery(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function globalSearch(query: string): SearchResult[] {
  const q = query.trim();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const r of reportRepository.getAll()) {
    if (includesQuery(r.title, q)) {
      results.push({ type: 'report', id: r.id, label: r.title, sublabel: `${r.year}년 보고서`, path: `/reports/${r.id}` });
    }
  }
  for (const c of committeeRepository.getAll()) {
    if (includesQuery(c.name, q)) {
      results.push({ type: 'committee', id: c.id, label: c.name, sublabel: 'ESG위원회', path: `/committees/${c.id}` });
    }
    for (const agenda of c.agendaItems) {
      if (includesQuery(agenda.title, q)) {
        results.push({ type: 'committee', id: c.id, label: agenda.title, sublabel: `${c.name} 안건`, path: `/committees/${c.id}` });
      }
    }
  }
  for (const d of disclosureRepository.getAll()) {
    if (includesQuery(d.name, q) || d.griCodes.some((code) => includesQuery(code, q))) {
      results.push({ type: 'disclosure', id: d.id, label: d.name, sublabel: `${d.year}년 공시데이터`, path: `/esg-data/${d.id}` });
    }
  }
  for (const row of rawDataRepository.getAll()) {
    if (includesQuery(row.dataItem, q) || includesQuery(row.note, q)) {
      results.push({
        type: 'rawData',
        id: row.id,
        label: row.dataItem,
        sublabel: `Raw Data · ${row.month}`,
        path: `/esg-data/${row.disclosureId}`,
      });
    }
  }
  for (const evidence of evidenceRepository.getAll()) {
    if (includesQuery(evidence.fileName, q)) {
      results.push({
        type: 'evidence',
        id: evidence.id,
        label: evidence.fileName,
        sublabel: '증빙데이터',
        path: `/esg-data/${evidence.disclosureId}`,
      });
    }
  }
  for (const assurance of assuranceRepository.getAll()) {
    if (includesQuery(assurance.fileName, q)) {
      results.push({
        type: 'assurance',
        id: assurance.id,
        label: assurance.fileName,
        sublabel: '검증보고서',
        path: `/esg-data/${assurance.relatedDisclosureIds[0] ?? ''}`,
      });
    }
  }
  for (const gri of griRepository.getAll()) {
    if (includesQuery(gri.code, q) || includesQuery(gri.title, q)) {
      results.push({ type: 'gri', id: gri.id, label: `${gri.code} ${gri.title}`, sublabel: 'GRI Standards', path: `/gri` });
    }
  }
  for (const folder of folderRepository.getAll()) {
    if (includesQuery(folder.name, q)) {
      const path = folder.ownerType === 'report' ? `/reports/${folder.ownerId}` : `/committees/${folder.ownerId}`;
      results.push({ type: 'folder', id: folder.id, label: folder.name, sublabel: '폴더', path });
    }
  }

  return results.slice(0, 50);
}
