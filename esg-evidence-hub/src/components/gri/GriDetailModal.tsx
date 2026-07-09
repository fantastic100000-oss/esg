import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import type { GRIStandard } from '../../types';
import type { GriMappingInfo } from '../../services/griMappingService';

export function GriDetailModal({
  open,
  onClose,
  standard,
  mapping,
}: {
  open: boolean;
  onClose: () => void;
  standard: GRIStandard | undefined;
  mapping: GriMappingInfo | undefined;
}) {
  if (!standard) return null;

  return (
    <Modal open={open} onClose={onClose} title={standard.code} width="max-w-xl">
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs font-medium text-slate-400">항목명</p>
          <p className="font-semibold text-slate-800">{standard.title}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">설명</p>
          <p className="text-slate-600">{standard.description}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">필요한 데이터</p>
          <p className="text-slate-600">{standard.requiredData}</p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-slate-400">관련 공시항목</p>
          {mapping && mapping.relatedDisclosures.length > 0 ? (
            <ul className="space-y-1">
              {mapping.relatedDisclosures.map((d) => (
                <li key={d.id} className="flex items-center justify-between rounded bg-slate-50 px-2 py-1">
                  <span>
                    {d.year} · {d.name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {d.value.toLocaleString()} {d.unit}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">연결된 공시항목이 없습니다.</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge label={`Raw Data ${mapping?.relatedRawDataCount ?? 0}건`} tone="bg-blue-100 text-blue-700" />
          <Badge label={`증빙데이터 ${mapping?.relatedEvidenceCount ?? 0}건`} tone="bg-slate-100 text-slate-600" />
          <Badge
            label={mapping?.reportReferenced ? '보고서 반영됨' : '보고서 미반영'}
            tone={mapping?.reportReferenced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
          />
        </div>
      </div>
    </Modal>
  );
}
