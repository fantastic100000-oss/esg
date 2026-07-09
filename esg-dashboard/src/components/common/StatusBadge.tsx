import { RECORD_STATUS_LABEL } from '../../types';
import type { RecordStatus } from '../../types';

const STYLES: Record<RecordStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  in_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: RecordStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status]}`}>
      {RECORD_STATUS_LABEL[status]}
    </span>
  );
}
