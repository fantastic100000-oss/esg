import { Card } from '../common/Card';
import { getDisclosureLineage } from '../../services/lineageService';

function Arrow() {
  return <span className="mx-2 text-slate-300">→</span>;
}

function Node({ label, sublabel }: { label: string; sublabel?: string }) {
  return (
    <div className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      {sublabel && <p className="text-xs text-slate-400">{sublabel}</p>}
    </div>
  );
}

export function LineageView({ disclosureId }: { disclosureId: string }) {
  const lineage = getDisclosureLineage(disclosureId);
  if (!lineage) return null;

  const { disclosure, reports, griCodes, rawRows, evidences, assurances } = lineage;

  return (
    <Card title="Data Lineage" subtitle="지속가능경영보고서 → GRI → 공시데이터 → Raw Data → 증빙데이터 → 검증보고서">
      <div className="flex flex-wrap items-center overflow-x-auto py-2">
        <Node label={reports.length > 0 ? reports.map((r) => r.title).join(', ') : '보고서 미반영'} sublabel="지속가능경영보고서" />
        <Arrow />
        <Node label={griCodes.length > 0 ? griCodes.join(', ') : '연결된 GRI 없음'} sublabel="GRI" />
        <Arrow />
        <Node label={disclosure.name} sublabel={`공시데이터 · ${disclosure.value.toLocaleString()} ${disclosure.unit}`} />
        <Arrow />
        <Node label={`Raw Data ${rawRows.length}건`} sublabel="원천 데이터" />
        <Arrow />
        <Node label={`증빙데이터 ${evidences.length}건`} sublabel="근거자료" />
        <Arrow />
        <Node label={`검증보고서 ${assurances.length}건`} sublabel="별도 보관" />
      </div>
    </Card>
  );
}
