import { HashRouter, Route, Routes } from 'react-router-dom';
import { AppDataProvider } from './lib/AppDataContext';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { ReportsPage } from './pages/ReportsPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { CommitteesPage } from './pages/CommitteesPage';
import { CommitteeDetailPage } from './pages/CommitteeDetailPage';
import { EsgDataListPage } from './pages/EsgDataListPage';
import { EsgDataDetailPage } from './pages/EsgDataDetailPage';
import { GriStandardsPage } from './pages/GriStandardsPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <AppDataProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />
            <Route path="/committees" element={<CommitteesPage />} />
            <Route path="/committees/:id" element={<CommitteeDetailPage />} />
            <Route path="/esg-data" element={<EsgDataListPage />} />
            <Route path="/esg-data/:id" element={<EsgDataDetailPage />} />
            <Route path="/gri" element={<GriStandardsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppDataProvider>
  );
}

export default App;
