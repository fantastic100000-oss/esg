import { useEffect, useMemo, useState } from 'react';
import { Card } from '../common/Card';
import { SITES } from '../../constants';
import { calculateEmissions, previousMonth, validateRecord } from '../../lib/calculations';
import { getRecentMonths } from '../../data/sampleData';
import type { EsgRecord, SiteId } from '../../types';

interface DataEntryFormProps {
  records: EsgRecord[];
  onSave: (record: EsgRecord) => void;
}

interface FormState {
  electricityKwh: string;
  cityGasM3: string;
  vehicleFuelL: string;
  waterM3: string;
  wasteKg: string;
  evidenceFileName: string;
}

const EMPTY_FORM: FormState = {
  electricityKwh: '',
  cityGasM3: '',
  vehicleFuelL: '',
  waterM3: '',
  wasteKg: '',
  evidenceFileName: '',
};

const NUMERIC_FIELD_META: { key: keyof FormState; label: string; unit: string }[] = [
  { key: 'electricityKwh', label: '전력 사용량', unit: 'kWh' },
  { key: 'cityGasM3', label: '도시가스 사용량', unit: 'm³' },
  { key: 'vehicleFuelL', label: '차량연료 사용량', unit: 'L' },
  { key: 'waterM3', label: '용수 사용량', unit: 'm³' },
  { key: 'wasteKg', label: '폐기물 발생량', unit: 'kg' },
];

export function DataEntryForm({ records, onSave }: DataEntryFormProps) {
  const months = useMemo(() => getRecentMonths(), []);
  const [siteId, setSiteId] = useState<SiteId>(SITES[0].id);
  const [month, setMonth] = useState(months[months.length - 1]);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [savedMessage, setSavedMessage] = useState(false);

  const existingRecord = records.find((r) => r.siteId === siteId && r.month === month);

  useEffect(() => {
    if (existingRecord) {
      setForm({
        electricityKwh: String(existingRecord.electricityKwh),
        cityGasM3: String(existingRecord.cityGasM3),
        vehicleFuelL: String(existingRecord.vehicleFuelL),
        waterM3: String(existingRecord.waterM3),
        wasteKg: String(existingRecord.wasteKg),
        evidenceFileName: existingRecord.evidenceFileName,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setSavedMessage(false);
    // existingRecord is derived from siteId/month/records; re-run only when selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteId, month]);

  const previewRecord: EsgRecord = {
    id: existingRecord?.id ?? `${siteId}-${month}`,
    siteId,
    month,
    electricityKwh: Number(form.electricityKwh) || 0,
    cityGasM3: Number(form.cityGasM3) || 0,
    vehicleFuelL: Number(form.vehicleFuelL) || 0,
    waterM3: Number(form.waterM3) || 0,
    wasteKg: Number(form.wasteKg) || 0,
    evidenceFileName: form.evidenceFileName,
    status: existingRecord?.status ?? 'draft',
    createdAt: existingRecord?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const emissions = calculateEmissions(previewRecord);
  const prevMonthRecord = records.find((r) => r.siteId === siteId && r.month === previousMonth(month));
  const validation = validateRecord(previewRecord, prevMonthRecord);

  function handleChange(key: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedMessage(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(previewRecord);
    setSavedMessage(true);
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="사업장 · 월 선택">
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">사업장</span>
              <select
                value={siteId}
                onChange={(e) => setSiteId(e.target.value as SiteId)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {SITES.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-600">월</span>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {existingRecord && (
            <p className="mt-3 text-xs text-amber-600">
              이미 등록된 데이터가 있습니다. 저장하면 기존 데이터가 수정됩니다.
            </p>
          )}
        </Card>

        <Card title="실적 데이터 입력">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {NUMERIC_FIELD_META.map((field) => {
              const isOutlier = validation.outlierFields.includes(field.key);
              return (
                <label key={field.key} className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-600">
                    {field.label} ({field.unit})
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={form[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                      isOutlier
                        ? 'border-amber-400 bg-amber-50 focus:border-amber-500'
                        : 'border-slate-300 focus:border-emerald-500'
                    }`}
                  />
                  {isOutlier && (
                    <span className="mt-1 block text-xs text-amber-600">
                      ⚠ 전월 대비 20% 이상 변동된 이상치입니다.
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </Card>

        <Card title="증빙자료">
          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-600">증빙파일명</span>
            <input
              type="text"
              placeholder="예: hq_2026-06_증빙.pdf"
              value={form.evidenceFileName}
              onChange={(e) => handleChange('evidenceFileName', e.target.value)}
              className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                validation.missingEvidence
                  ? 'border-red-300 bg-red-50 focus:border-red-500'
                  : 'border-slate-300 focus:border-emerald-500'
              }`}
            />
            {validation.missingEvidence && (
              <span className="mt-1 block text-xs text-red-600">⚠ 증빙파일명이 입력되지 않았습니다.</span>
            )}
          </label>
        </Card>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            저장
          </button>
          {savedMessage && <span className="text-sm font-medium text-emerald-600">저장되었습니다.</span>}
        </div>
      </div>

      <div className="space-y-6">
        <Card title="자동 계산 미리보기" subtitle="배출계수 기반 자동 산정 (예시 계수 적용)">
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Scope 1 (도시가스·차량연료)</dt>
              <dd className="font-semibold text-slate-800">{emissions.scope1TCo2e.toFixed(3)} tCO2e</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500">Scope 2 (전력)</dt>
              <dd className="font-semibold text-slate-800">{emissions.scope2TCo2e.toFixed(3)} tCO2e</dd>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <dt className="font-medium text-slate-600">합계</dt>
              <dd className="text-lg font-bold text-emerald-700">{emissions.totalTCo2e.toFixed(3)} tCO2e</dd>
            </div>
          </dl>
        </Card>

        <Card title="데이터 검증">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <span>{validation.outlierFields.length > 0 ? '⚠️' : '✅'}</span>
              <span className="text-slate-600">
                이상치 항목: {validation.outlierFields.length > 0 ? `${validation.outlierFields.length}건` : '없음'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span>{validation.missingFields.length > 0 ? '⚠️' : '✅'}</span>
              <span className="text-slate-600">
                누락 항목: {validation.missingFields.length > 0 ? `${validation.missingFields.length}건` : '없음'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <span>{validation.missingEvidence ? '⚠️' : '✅'}</span>
              <span className="text-slate-600">증빙파일: {validation.missingEvidence ? '미입력' : '입력 완료'}</span>
            </li>
          </ul>
        </Card>
      </div>
    </form>
  );
}
