import { useRef } from 'react';
import { useAppData } from '../../lib/AppDataContext';
import { deleteRawDataRow, replaceRawDataRows, saveRawDataRow } from '../../services/disclosureService';
import { generateId } from '../../lib/id';
import { downloadCsv, parseCsv, parseTsv } from '../../lib/csv';
import type { RawDataRow } from '../../types';

const CSV_HEADER = ['사업장', '월', '데이터항목', '원천값', '단위', '환산값', '입력자', '비고'];

interface RawDataGridProps {
  disclosureId: string;
  rows: RawDataRow[];
  onChange: () => void;
}

export function RawDataGrid({ disclosureId, rows, onChange }: RawDataGridProps) {
  const { sites } = useAppData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sorted = [...rows].sort((a, b) => a.month.localeCompare(b.month) || a.siteId.localeCompare(b.siteId));

  function siteName(siteId: string) {
    return sites.find((s) => s.id === siteId)?.name ?? siteId;
  }

  function siteIdByName(name: string): string {
    return sites.find((s) => s.name === name.trim())?.id ?? sites[0]?.id ?? '';
  }

  function updateRow(row: RawDataRow, patch: Partial<RawDataRow>) {
    saveRawDataRow({ ...row, ...patch, updatedAt: new Date().toISOString() });
    onChange();
  }

  function handleAddRow() {
    const now = new Date().toISOString();
    const newRow: RawDataRow = {
      id: generateId('raw'),
      disclosureId,
      siteId: sites[0]?.id ?? '',
      month: now.slice(0, 7),
      dataItem: '',
      sourceValue: 0,
      unit: '',
      convertedValue: 0,
      inputBy: '',
      updatedAt: now,
      note: '',
    };
    saveRawDataRow(newRow);
    onChange();
  }

  function handleDeleteRow(rowId: string) {
    if (!confirm('이 행을 삭제할까요?')) return;
    deleteRawDataRow(rowId);
    onChange();
  }

  async function handleCopyAll() {
    const csvRows = [CSV_HEADER, ...sorted.map(rowToCells)];
    await navigator.clipboard.writeText(csvRows.map((r) => r.join('\t')).join('\n'));
  }

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      appendParsedRows(parseTsv(text));
    } catch {
      alert('클립보드 접근 권한이 없습니다. 브라우저 권한을 확인해주세요.');
    }
  }

  function rowToCells(row: RawDataRow): string[] {
    return [siteName(row.siteId), row.month, row.dataItem, String(row.sourceValue), row.unit, String(row.convertedValue), row.inputBy, row.note];
  }

  function appendParsedRows(cellRows: string[][]) {
    const now = new Date().toISOString();
    const dataRows = cellRows[0]?.[0] === CSV_HEADER[0] ? cellRows.slice(1) : cellRows;
    const newRows: RawDataRow[] = dataRows
      .filter((cells) => cells.length >= 6)
      .map((cells) => ({
        id: generateId('raw'),
        disclosureId,
        siteId: siteIdByName(cells[0] ?? ''),
        month: cells[1] ?? now.slice(0, 7),
        dataItem: cells[2] ?? '',
        sourceValue: Number(cells[3]) || 0,
        unit: cells[4] ?? '',
        convertedValue: Number(cells[5]) || 0,
        inputBy: cells[6] ?? '',
        updatedAt: now,
        note: cells[7] ?? '',
      }));
    if (newRows.length === 0) return;
    replaceRawDataRows(disclosureId, [...rows, ...newRows]);
    onChange();
  }

  function handleDownloadCsv() {
    downloadCsv(`raw-data-${disclosureId}.csv`, [CSV_HEADER, ...sorted.map(rowToCells)]);
  }

  function handleUploadCsv(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      appendParsedRows(parseCsv(text));
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <button type="button" onClick={handleAddRow} className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
          + 행 추가
        </button>
        <button type="button" onClick={handleCopyAll} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          복사
        </button>
        <button type="button" onClick={handlePaste} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          붙여넣기
        </button>
        <button type="button" onClick={handleDownloadCsv} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          엑셀 다운로드 (CSV)
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
          엑셀 업로드 (CSV)
        </button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleUploadCsv} className="hidden" />
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full whitespace-nowrap text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-2 py-2">사업장</th>
              <th className="px-2 py-2">월</th>
              <th className="px-2 py-2">데이터항목</th>
              <th className="px-2 py-2">원천값</th>
              <th className="px-2 py-2">단위</th>
              <th className="px-2 py-2">환산값</th>
              <th className="px-2 py-2">입력자</th>
              <th className="px-2 py-2">수정일</th>
              <th className="px-2 py-2">비고</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((row) => (
              <tr key={row.id}>
                <td className="p-1">
                  <select
                    value={row.siteId}
                    onChange={(e) => updateRow(row, { siteId: e.target.value })}
                    className="w-24 rounded border border-transparent px-1 py-1 hover:border-slate-200 focus:border-emerald-400 focus:outline-none"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-1">
                  <input
                    type="month"
                    value={row.month}
                    onChange={(e) => updateRow(row, { month: e.target.value })}
                    className="w-28 rounded border border-transparent px-1 py-1 hover:border-slate-200 focus:border-emerald-400 focus:outline-none"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={row.dataItem}
                    onChange={(e) => updateRow(row, { dataItem: e.target.value })}
                    className="w-28 rounded border border-transparent px-1 py-1 hover:border-slate-200 focus:border-emerald-400 focus:outline-none"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    value={row.sourceValue}
                    onChange={(e) => updateRow(row, { sourceValue: Number(e.target.value) })}
                    className="w-24 rounded border border-transparent px-1 py-1 text-right hover:border-slate-200 focus:border-emerald-400 focus:outline-none"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) => updateRow(row, { unit: e.target.value })}
                    className="w-14 rounded border border-transparent px-1 py-1 hover:border-slate-200 focus:border-emerald-400 focus:outline-none"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="number"
                    value={row.convertedValue}
                    onChange={(e) => updateRow(row, { convertedValue: Number(e.target.value) })}
                    className="w-24 rounded border border-transparent px-1 py-1 text-right font-medium text-emerald-700 hover:border-slate-200 focus:border-emerald-400 focus:outline-none"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={row.inputBy}
                    onChange={(e) => updateRow(row, { inputBy: e.target.value })}
                    className="w-20 rounded border border-transparent px-1 py-1 hover:border-slate-200 focus:border-emerald-400 focus:outline-none"
                  />
                </td>
                <td className="px-2 py-1 text-slate-400">{row.updatedAt.slice(0, 10)}</td>
                <td className="p-1">
                  <input
                    type="text"
                    value={row.note}
                    onChange={(e) => updateRow(row, { note: e.target.value })}
                    className="w-28 rounded border border-transparent px-1 py-1 hover:border-slate-200 focus:border-emerald-400 focus:outline-none"
                  />
                </td>
                <td className="p-1">
                  <button type="button" onClick={() => handleDeleteRow(row.id)} className="rounded px-2 py-1 text-red-400 hover:bg-red-50">
                    삭제
                  </button>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                  Raw Data가 없습니다. "행 추가"로 데이터를 입력하세요.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
