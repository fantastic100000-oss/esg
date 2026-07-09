import { useState } from 'react';
import { Modal } from '../common/Modal';
import { MultiSelectChecklist } from '../common/MultiSelectChecklist';
import { useAppData } from '../../lib/AppDataContext';
import { extensionOf } from '../../lib/format';
import type { EvidenceDocument, RawDataRow } from '../../types';

interface EvidenceFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<EvidenceDocument, 'id' | 'disclosureId'>) => void;
  rawRows: RawDataRow[];
  initial?: EvidenceDocument;
}

export function EvidenceForm({ open, onClose, onSave, rawRows, initial }: EvidenceFormProps) {
  const { documentTypes } = useAppData();
  const [fileName, setFileName] = useState(initial?.fileName ?? '');
  const [sizeBytes, setSizeBytes] = useState(initial?.sizeBytes ?? 0);
  const [documentType, setDocumentType] = useState(initial?.documentType ?? documentTypes[0]?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [uploadedBy, setUploadedBy] = useState(initial?.uploadedBy ?? '');
  const [relatedRawDataIds, setRelatedRawDataIds] = useState<string[]>(initial?.relatedRawDataIds ?? []);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setSizeBytes(file.size);
    e.target.value = '';
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fileName.trim()) return;
    onSave({
      relatedRawDataIds,
      documentType,
      fileName: fileName.trim(),
      extension: extensionOf(fileName),
      sizeBytes,
      uploadedAt: initial?.uploadedAt ?? new Date().toISOString(),
      uploadedBy: uploadedBy.trim() || '담당자',
      description,
    });
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? '증빙데이터 수정' : '증빙데이터 등록'} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">파일 선택 (선택 시 문서명·크기 자동 입력, 내용은 저장되지 않음)</span>
          <input type="file" onChange={handleFilePick} className="block w-full text-sm text-slate-500" />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">문서명</span>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">업로드자</span>
            <input
              type="text"
              value={uploadedBy}
              onChange={(e) => setUploadedBy(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">문서유형</span>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          >
            {documentTypes.map((dt) => (
              <option key={dt.id} value={dt.name}>
                {dt.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">설명</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-600">관련 Raw Data 행</span>
          <MultiSelectChecklist
            options={rawRows.map((r) => ({ id: r.id, label: `${r.month} · ${r.dataItem}`, group: r.siteId }))}
            selected={relatedRawDataIds}
            onChange={setRelatedRawDataIds}
          />
        </label>
        <button type="submit" className="w-full rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
          저장
        </button>
      </form>
    </Modal>
  );
}
