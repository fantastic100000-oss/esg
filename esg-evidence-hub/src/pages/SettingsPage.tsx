import { useNavigate } from 'react-router-dom';
import { useAppData } from '../lib/AppDataContext';
import { Card } from '../components/common/Card';
import { TaxonomyEditor } from '../components/settings/TaxonomyEditor';
import { DisclosureItemDefEditor } from '../components/settings/DisclosureItemDefEditor';
import {
  categoryRepository,
  dashboardConfigStore,
  departmentRepository,
  documentTypeRepository,
  siteRepository,
  verificationStatusRepository,
} from '../repositories';
import { getMetricLabel } from '../services/dashboardService';

export function SettingsPage() {
  const { categories, departments, sites, documentTypes, verificationStatuses, dashboardConfig, refresh, resetAll, resetGri } = useAppData();
  const navigate = useNavigate();

  function handleRemoveCard(cardId: string) {
    dashboardConfigStore.set({ ...dashboardConfig, cards: dashboardConfig.cards.filter((c) => c.id !== cardId) });
    refresh();
  }

  return (
    <div className="space-y-6">
      <Card
        title="대시보드 표시 항목"
        subtitle="현재 대시보드에 표시 중인 카드 목록입니다. 추가/순서 변경은 Dashboard 화면에서 할 수 있습니다."
        actions={
          <button type="button" onClick={() => navigate('/')} className="rounded px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50">
            Dashboard로 이동
          </button>
        }
      >
        <ul className="space-y-1">
          {dashboardConfig.cards.map((card) => (
            <li key={card.id} className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-slate-50">
              <span className="text-slate-700">{getMetricLabel(card.metricKey)}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{card.chartType}</span>
                <button type="button" onClick={() => handleRemoveCard(card.id)} className="rounded px-2 py-0.5 text-xs text-red-500 hover:bg-red-50">
                  삭제
                </button>
              </div>
            </li>
          ))}
          {dashboardConfig.cards.length === 0 && <p className="py-3 text-center text-xs text-slate-400">표시 중인 카드가 없습니다.</p>}
        </ul>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <TaxonomyEditor title="ESG 카테고리" idPrefix="category" items={categories} repository={categoryRepository} onChange={refresh} />
        <TaxonomyEditor title="담당부서 목록" idPrefix="dept" items={departments} repository={departmentRepository} onChange={refresh} />
        <TaxonomyEditor title="사업장 목록" idPrefix="site" items={sites} repository={siteRepository} onChange={refresh} />
        <TaxonomyEditor title="문서 유형" idPrefix="doctype" items={documentTypes} repository={documentTypeRepository} onChange={refresh} />
        <TaxonomyEditor title="검증 상태값" idPrefix="status" items={verificationStatuses} repository={verificationStatusRepository} onChange={refresh} />
      </div>

      <DisclosureItemDefEditor />

      <Card title="데이터 초기화">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              if (confirm('GRI 기준을 샘플 데이터로 초기화할까요?')) resetGri();
            }}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            GRI 기준 샘플 데이터 초기화
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm('모든 데이터를 삭제하고 초기 샘플 데이터로 되돌립니다. 계속할까요?')) resetAll();
            }}
            className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            localStorage 데이터 초기화
          </button>
        </div>
      </Card>
    </div>
  );
}
