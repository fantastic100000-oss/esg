import { useState } from 'react';

export interface ChecklistOption {
  id: string;
  label: string;
  group?: string;
}

interface MultiSelectChecklistProps {
  options: ChecklistOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function MultiSelectChecklist({ options, selected, onChange, placeholder = '검색...' }: MultiSelectChecklistProps) {
  const [filter, setFilter] = useState('');
  const filtered = options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()));

  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
  }

  return (
    <div className="rounded-md border border-slate-300">
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder={placeholder}
        className="w-full border-b border-slate-200 px-3 py-2 text-sm focus:outline-none"
      />
      <div className="max-h-40 overflow-y-auto p-1">
        {filtered.length === 0 && <p className="px-2 py-3 text-center text-xs text-slate-400">항목이 없습니다.</p>}
        {filtered.map((opt) => (
          <label key={opt.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
            <input type="checkbox" checked={selected.includes(opt.id)} onChange={() => toggle(opt.id)} className="accent-emerald-600" />
            <span className="truncate text-slate-700">{opt.label}</span>
            {opt.group && <span className="ml-auto shrink-0 text-xs text-slate-400">{opt.group}</span>}
          </label>
        ))}
      </div>
      {selected.length > 0 && <p className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-400">{selected.length}개 선택됨</p>}
    </div>
  );
}
