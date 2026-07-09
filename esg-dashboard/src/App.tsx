import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { DataEntryPage } from './pages/DataEntryPage';
import { RecordsPage } from './pages/RecordsPage';
import { GriMappingPage } from './pages/GriMappingPage';
import { useEsgRecords } from './lib/useEsgRecords';

function App() {
  const { records, saveRecord, changeStatus, resetSampleData } = useEsgRecords();

  return (
    <HashRouter>
      <Layout onResetSampleData={resetSampleData}>
        <Routes>
          <Route path="/" element={<DashboardPage records={records} />} />
          <Route path="/entry" element={<DataEntryPage records={records} onSave={saveRecord} />} />
          <Route path="/records" element={<RecordsPage records={records} onChangeStatus={changeStatus} />} />
          <Route path="/gri" element={<GriMappingPage records={records} />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}

export default App;
