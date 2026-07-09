import { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { SITE_NAME } from '../../constants';
import { calculateEmissions } from '../../lib/calculations';
import { RECORD_STATUS_LABEL } from '../../types';
import type { EsgRecord, RecordStatus } from '../../types';

const STATUS_OPTIONS: RecordStatus[] = ['draft', 'in_review', 'approved', 'rejected'];

interface ApprovalWorkflowProps {
  record: EsgRecord | undefined;
  onChangeStatus: (id: string, status: RecordStatus, rejectionReason?: string) => void;
}

export function ApprovalWorkflow({ record, onChangeStatus }: ApprovalWorkflowProps) {
  const [nextStatus, setNextStatus] = useState<RecordStatus>(record?.status ?? 'draft');
  const [reason, setReason] = useState(record?.rejectionReason ?? '');

  useEffect(() => {
    setNextStatus(record?.status ?? 'draft');
    setReason(record?.rejectionReason ?? '');
  }, [record?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!record) {
    return (
      <Card title="승인 워크플로우">
        <p className="text-sm text-slate-400">좌측 표에서 데이터를 선택하면 승인 상태를 관리할 수 있습니다.</p>
      </Card>
    );
  }

  const emissions = calculateEmissions(record);
  const canSubmit = nextStatus !== 'rejected' || reason.trim().length > 0;

  return (
    <Card title="승인 워크플로우" subtitle={`${SITE_NAME[record.siteId]} · ${record.month}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">현재 상태</span>
        <StatusBadge status={record.status} />
      </div>

      <dl className="mb-4 space-y-1 text-sm text-slate-500">
        <div className="flex justify-between">
          <dt>총 배출량</dt>
          <dd className="font-medium text-slate-700">{emissions.totalTCo2e.toFixed(2)} tCO2e</dd>
        </div>
        <div className="flex justify-between">
          <dt>증빙파일</dt>
          <dd className="font-medium text-slate-700">{record.evidenceFileName || '미입력'}</dd>
        </div>
      </dl>

      {record.status === 'rejected' && record.rejectionReason && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <p className="font-semibold">반려 사유</p>
          <p>{record.rejectionReason}</p>
        </div>
      )}

      <div className="mb-3">
        <p className="mb-2 text-sm font-medium text-slate-600">상태 변경</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setNextStatus(status)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                nextStatus === status
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {RECORD_STATUS_LABEL[status]}
            </button>
          ))}
        </div>
      </div>

      {nextStatus === 'rejected' && (
        <label className="mb-3 block text-sm">
          <span className="mb-1 block font-medium text-slate-600">반려 사유</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="반려 사유를 입력하세요"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
      )}

      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => onChangeStatus(record.id, nextStatus, nextStatus === 'rejected' ? reason.trim() : undefined)}
        className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        상태 저장
      </button>
    </Card>
  );
}
