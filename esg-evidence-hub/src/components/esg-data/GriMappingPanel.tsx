import { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { GriDetailModal } from '../gri/GriDetailModal';
import { useAppData } from '../../lib/AppDataContext';
import { getGriMappingForDisclosure } from '../../services/griMappingService';
import type { DisclosureData } from '../../types';

export function GriMappingPanel({ disclosure }: { disclosure: DisclosureData }) {
  const { gri } = useAppData();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const mappings = getGriMappingForDisclosure(disclosure);
  const selectedStandard = gri.find((g) => g.code === selectedCode);
  const selectedMapping = mappings.find((m) => m.code === selectedCode);

  return (
    <Card title="GRI 매핑">
      {mappings.length === 0 && <p className="py-4 text-center text-sm text-slate-400">연결된 GRI가 없습니다.</p>}
      <div className="space-y-2">
        {mappings.map((mapping) => {
          const standard = gri.find((g) => g.code === mapping.code);
          return (
            <button
              key={mapping.code}
              type="button"
              onClick={() => setSelectedCode(mapping.code)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-left hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-semibold text-emerald-700">{mapping.code}</p>
                <p className="text-xs text-slate-500">{standard?.title}</p>
              </div>
              <Badge
                label={mapping.reportReferenced ? '보고서 반영됨' : '보고서 미반영'}
                tone={mapping.reportReferenced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
              />
            </button>
          );
        })}
      </div>
      <GriDetailModal open={!!selectedCode} onClose={() => setSelectedCode(null)} standard={selectedStandard} mapping={selectedMapping} />
    </Card>
  );
}
