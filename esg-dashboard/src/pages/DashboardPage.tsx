import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SiteComparisonChart } from '../components/dashboard/SiteComparisonChart';
import { MonthlyTrendChart } from '../components/dashboard/MonthlyTrendChart';
import { getLatestMonth } from '../lib/aggregations';
import type { EsgRecord } from '../types';

interface DashboardPageProps {
  records: EsgRecord[];
}

export function DashboardPage({ records }: DashboardPageProps) {
  const latestMonth = getLatestMonth(records);

  return (
    <div className="space-y-6">
      <SummaryCards records={records} latestMonth={latestMonth} />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SiteComparisonChart records={records} month={latestMonth} />
        <MonthlyTrendChart records={records} />
      </div>
    </div>
  );
}
