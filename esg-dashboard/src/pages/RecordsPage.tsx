import { useMemo, useState } from 'react';
import { DataTable } from '../components/data-table/DataTable';
import { MissingDataBanner } from '../components/data-table/MissingDataBanner';
import { ApprovalWorkflow } from '../components/approval/ApprovalWorkflow';
import { buildValidationMap, findMissingCombos } from '../lib/validationMap';
import type { EsgRecord, RecordStatus } from '../types';

interface RecordsPageProps {
  records: EsgRecord[];
  onChangeStatus: (id: string, status: RecordStatus, rejectionReason?: string) => void;
}

export function RecordsPage({ records, onChangeStatus }: RecordsPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const validationMap = useMemo(() => buildValidationMap(records), [records]);
  const missing = useMemo(() => findMissingCombos(records), [records]);
  const selectedRecord = records.find((r) => r.id === selectedId);

  return (
    <div className="space-y-6">
      <MissingDataBanner missing={missing} />
      <DataTable
        records={records}
        validationMap={validationMap}
        selectedId={selectedId}
        onSelectRecord={setSelectedId}
      />
      <div className="max-w-md">
        <ApprovalWorkflow record={selectedRecord} onChangeStatus={onChangeStatus} />
      </div>
    </div>
  );
}
