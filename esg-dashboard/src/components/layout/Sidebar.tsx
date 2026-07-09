import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: '대시보드', icon: '📊' },
  { to: '/entry', label: 'ESG 데이터 입력', icon: '📝' },
  { to: '/records', label: '데이터 관리 · 승인', icon: '📋' },
  { to: '/gri', label: 'GRI 공시 매핑', icon: '📄' },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-slate-900 text-slate-200">
      <div className="flex items-center gap-2 px-5 py-5 text-lg font-bold text-white">
        <span className="text-emerald-400">🌱</span>
        ESG 데이터 플랫폼
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-xs text-slate-500">
        데모 프로토타입 · 데이터는 브라우저에 로컬 저장됩니다.
      </div>
    </aside>
  );
}
