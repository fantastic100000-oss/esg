import { STORAGE_KEYS } from '../constants';
import { generateSampleRecords } from '../data/sampleData';
import type { EsgRecord } from '../types';

function loadRecords(): EsgRecord[] {
  const raw = localStorage.getItem(STORAGE_KEYS.records);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as EsgRecord[];
  } catch {
    return [];
  }
}

function saveRecords(records: EsgRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
}

/** 최초 실행 시 샘플 데이터를 localStorage에 시딩한다. */
export function ensureSeedData(): void {
  const seeded = localStorage.getItem(STORAGE_KEYS.seeded);
  if (seeded) return;
  saveRecords(generateSampleRecords());
  localStorage.setItem(STORAGE_KEYS.seeded, 'true');
}

export function getAllRecords(): EsgRecord[] {
  return loadRecords();
}

export function upsertRecord(record: EsgRecord): EsgRecord[] {
  const records = loadRecords();
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  saveRecords(records);
  return records;
}

export function deleteRecord(id: string): EsgRecord[] {
  const records = loadRecords().filter((r) => r.id !== id);
  saveRecords(records);
  return records;
}

export function resetToSampleData(): EsgRecord[] {
  const records = generateSampleRecords();
  saveRecords(records);
  localStorage.setItem(STORAGE_KEYS.seeded, 'true');
  return records;
}
