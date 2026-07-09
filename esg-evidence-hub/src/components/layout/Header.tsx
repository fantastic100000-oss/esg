import { useLocation } from 'react-router-dom';
import { GlobalSearch } from './GlobalSearch';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: '연도별 ESG 현황' },
  '/reports': { title: '지속가능경영보고서', subtitle: '보고서 및 관련 자료 관리' },
  '/committees': { title: 'ESG위원회', subtitle: '위원회 자료 및 안건 관리' },
  '/esg-data': { title: 'ESG 데이터', subtitle: '공시데이터 · Raw Data · 증빙 · 검증 · GRI 연결 관리' },
  '/gri': { title: 'GRI Standards', subtitle: 'GRI 기준 및 데이터 연결 현황' },
  '/settings': { title: 'Settings', subtitle: '기준정보 및 데이터 관리' },
};

function matchTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  const base = '/' + pathname.split('/')[1];
  return TITLES[base] ?? { title: 'ESG Evidence Hub', subtitle: '' };
}

export function Header() {
  const location = useLocation();
  const meta = matchTitle(location.pathname);

  return (
    <header className="flex items-center justify-between gap-6 border-b border-slate-200 bg-white px-8 py-4">
      <div className="shrink-0">
        <h1 className="text-xl font-bold text-slate-900">{meta.title}</h1>
        <p className="text-sm text-slate-500">{meta.subtitle}</p>
      </div>
      <GlobalSearch />
      <div className="h-9 w-9 shrink-0 rounded-full bg-emerald-500 text-center text-sm font-semibold leading-9 text-white">
        ESG
      </div>
    </header>
  );
}
