import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { globalSearch } from '../../services/searchService';

const TYPE_LABEL: Record<string, string> = {
  report: '보고서',
  committee: '위원회',
  disclosure: '공시데이터',
  rawData: 'Raw Data',
  evidence: '증빙데이터',
  assurance: '검증보고서',
  gri: 'GRI',
  folder: '폴더',
};

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => globalSearch(query), [query]);

  function handleBlur() {
    window.setTimeout(() => setOpen(false), 150);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder="보고서, 공시항목, 증빙데이터, GRI 코드 검색..."
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none"
      />
      {open && query.trim() && (
        <div className="absolute z-20 mt-1 max-h-96 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg">
          {results.length === 0 && <div className="px-4 py-3 text-sm text-slate-400">검색 결과가 없습니다.</div>}
          {results.map((r) => (
            <button
              key={`${r.type}-${r.id}-${r.label}`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                navigate(r.path);
                setOpen(false);
                setQuery('');
              }}
              className="flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm hover:bg-slate-50"
            >
              <span className="truncate text-slate-700">{r.label}</span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {TYPE_LABEL[r.type]} · {r.sublabel}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
