import type { MissingCombo } from '../../lib/validationMap';

export function MissingDataBanner({ missing }: { missing: MissingCombo[] }) {
  if (missing.length === 0) return null;

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <p className="font-semibold">⚠ 누락 데이터 {missing.length}건</p>
      <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {missing.map((m) => (
          <li key={`${m.siteId}-${m.month}`}>
            {m.siteName} · {m.month}
          </li>
        ))}
      </ul>
    </div>
  );
}
