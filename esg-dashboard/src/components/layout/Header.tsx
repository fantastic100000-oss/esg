import { useLocation } from 'react-router-dom';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: '대시보드', subtitle: '전사 ESG 핵심 지표 현황' },
  '/entry': { title: 'ESG 데이터 입력', subtitle: '사업장별 월간 실적 등록' },
  '/records': { title: '데이터 관리 · 승인', subtitle: '입력 데이터 검증 및 승인 워크플로우' },
  '/gri': { title: 'GRI 공시 매핑', subtitle: '입력 데이터를 GRI 지표에 매핑' },
};

interface HeaderProps {
  onResetSampleData: () => void;
}

export function Header({ onResetSampleData }: HeaderProps) {
  const location = useLocation();
  const meta = TITLES[location.pathname] ?? TITLES['/'];

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">{meta.title}</h1>
        <p className="text-sm text-slate-500">{meta.subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (confirm('샘플 데이터로 초기화하면 현재 입력한 데이터가 모두 사라집니다. 계속할까요?')) {
              onResetSampleData();
            }
          }}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          샘플 데이터 초기화
        </button>
        <div className="h-9 w-9 rounded-full bg-emerald-500 text-center text-sm font-semibold leading-9 text-white">
          ESG
        </div>
      </div>
    </header>
  );
}
