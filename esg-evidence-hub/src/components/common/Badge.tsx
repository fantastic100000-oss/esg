const PALETTE = [
  'bg-slate-100 text-slate-600',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-red-100 text-red-700',
  'bg-violet-100 text-violet-700',
];

function hashColor(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) % PALETTE.length;
  return PALETTE[hash];
}

const STATUS_COLOR: Record<string, string> = {
  미검증: 'bg-slate-100 text-slate-600',
  검토중: 'bg-amber-100 text-amber-700',
  검증완료: 'bg-emerald-100 text-emerald-700',
  보완요청: 'bg-red-100 text-red-700',
};

export function Badge({ label, tone }: { label: string; tone?: string }) {
  const className = tone ?? STATUS_COLOR[label] ?? hashColor(label);
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{label}</span>;
}
