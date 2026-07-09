import { useCallback, useEffect, useState } from 'react';
import {
  ensureSeedData,
  getAllRecords,
  resetToSampleData,
  upsertRecord,
} from './storage';
import type { EsgRecord, RecordStatus } from '../types';

export function useEsgRecords() {
  const [records, setRecords] = useState<EsgRecord[]>([]);

  useEffect(() => {
    ensureSeedData();
    setRecords(getAllRecords());
  }, []);

  const saveRecord = useCallback((record: EsgRecord) => {
    const updated = upsertRecord(record);
    setRecords(updated);
  }, []);

  const changeStatus = useCallback(
    (id: string, status: RecordStatus, rejectionReason?: string) => {
      const target = getAllRecords().find((r) => r.id === id);
      if (!target) return;
      const updated: EsgRecord = {
        ...target,
        status,
        rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        updatedAt: new Date().toISOString(),
      };
      saveRecord(updated);
    },
    [saveRecord],
  );

  const resetSampleData = useCallback(() => {
    setRecords(resetToSampleData());
  }, []);

  return { records, saveRecord, changeStatus, resetSampleData };
}
