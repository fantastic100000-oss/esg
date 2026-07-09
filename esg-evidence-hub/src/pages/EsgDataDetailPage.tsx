import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { disclosureRepository, rawDataRepository, evidenceRepository, assuranceRepository } from '../repositories';
import { DisclosureInfoPanel } from '../components/esg-data/DisclosureInfoPanel';
import { RawDataGrid } from '../components/esg-data/RawDataGrid';
import { EvidenceList } from '../components/esg-data/EvidenceList';
import { AssuranceList } from '../components/esg-data/AssuranceList';
import { GriMappingPanel } from '../components/esg-data/GriMappingPanel';
import { LineageView } from '../components/esg-data/LineageView';

type TabKey = 'rawData' | 'evidence' | 'assurance' | 'gri' | 'lineage';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'rawData', label: '2. Raw Data' },
  { key: 'evidence', label: '3. 증빙데이터' },
  { key: 'assurance', label: '4. 검증보고서' },
  { key: 'gri', label: '5. GRI 매핑' },
  { key: 'lineage', label: 'Data Lineage' },
];

export function EsgDataDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { disclosures, rawData, evidence, assurance, refresh } = useAppData();
  const [tab, setTab] = useState<TabKey>('rawData');
  const navigate = useNavigate();

  const disclosure = disclosures.find((d) => d.id === id);
  if (!disclosure) {
    return <p className="text-sm text-slate-400">공시데이터를 찾을 수 없습니다.</p>;
  }

  const rows = rawData.filter((r) => r.disclosureId === disclosure.id);
  const evidenceDocs = evidence.filter((e) => e.disclosureId === disclosure.id);
  const assuranceDocs = assurance.filter((a) => a.relatedDisclosureIds.includes(disclosure.id));

  function handleDelete() {
    if (!confirm(`"${disclosure!.name}" (${disclosure!.year}) 공시데이터를 삭제할까요? Raw Data/증빙데이터도 함께 삭제됩니다.`)) return;
    rows.forEach((r) => rawDataRepository.remove(r.id));
    evidenceDocs.forEach((e) => evidenceRepository.remove(e.id));
    assuranceDocs.forEach((a) => assuranceRepository.update({ ...a, relatedDisclosureIds: a.relatedDisclosureIds.filter((did) => did !== disclosure!.id) }));
    disclosureRepository.remove(disclosure!.id);
    refresh();
    navigate('/esg-data');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button type="button" onClick={handleDelete} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50">
          공시데이터 삭제
        </button>
      </div>

      <DisclosureInfoPanel disclosure={disclosure} onChange={refresh} />

      <div className="flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === t.key ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'rawData' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <RawDataGrid disclosureId={disclosure.id} rows={rows} onChange={refresh} />
        </div>
      )}
      {tab === 'evidence' && <EvidenceList disclosureId={disclosure.id} evidence={evidenceDocs} rawRows={rows} onChange={refresh} />}
      {tab === 'assurance' && <AssuranceList disclosureId={disclosure.id} assurance={assuranceDocs} onChange={refresh} />}
      {tab === 'gri' && <GriMappingPanel disclosure={disclosure} />}
      {tab === 'lineage' && <LineageView disclosureId={disclosure.id} />}
    </div>
  );
}
