import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/reports', label: '지속가능경영보고서', icon: '📘' },
  { to: '/committees', label: 'ESG위원회', icon: '🏛️' },
  { to: '/esg-data', label: 'ESG 데이터', icon: '🗃️' },
  { to: '/gri', label: 'GRI Standards', icon: '📑' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-slate-900 text-slate-200">
      <div className="flex items-center gap-2 px-5 py-5 text-base font-bold text-white">
        <span className="text-emerald-400">🌐</span>
        ESG Evidence Hub
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-xs text-slate-500">
        모든 데이터는 브라우저 localStorage에 저장됩니다. (백엔드/API 없음)
      </div>
    </aside>
  );
}
