import { DataEntryForm } from '../components/data-entry/DataEntryForm';
import type { EsgRecord } from '../types';

interface DataEntryPageProps {
  records: EsgRecord[];
  onSave: (record: EsgRecord) => void;
}

export function DataEntryPage({ records, onSave }: DataEntryPageProps) {
  return <DataEntryForm records={records} onSave={onSave} />;
}
