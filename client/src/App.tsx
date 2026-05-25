import { useState } from 'react';
import ScanPage from './pages/ScanPage';
import DashboardPage from './pages/DashboardPage';
import FindingDetailPage from './pages/FindingDetailPage';
import RotationChecklistsPage from './pages/RotationChecklistsPage';
import AllowlistPage from './pages/AllowlistPage';
import PreCommitPage from './pages/PreCommitPage';
import ReportsPage from './pages/ReportsPage';

type Page = 'scan' | 'dashboard' | 'finding-detail' | 'rotation' | 'allowlist' | 'precommit' | 'reports';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('scan');
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [scanRunId, setScanRunId] = useState<string | null>(null);

  const navigate = (page: Page, findingId?: string) => {
    setCurrentPage(page);
    if (findingId) setSelectedFindingId(findingId);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-red-700 text-white px-4 py-1 text-center text-xs font-bold">
        WARNING: Only scan systems, code, APIs, and infrastructure you own or are authorized to test.
      </header>
      <nav className="bg-gray-800 text-white px-6 py-3 flex items-center gap-6">
        <h1 className="text-lg font-bold">SecretOps Sentinel</h1>
        <button onClick={() => navigate('scan')} className="hover:text-red-300 text-sm">Scan</button>
        <button onClick={() => navigate('dashboard')} className="hover:text-red-300 text-sm">Dashboard</button>
        <button onClick={() => navigate('rotation')} className="hover:text-red-300 text-sm">Rotation</button>
        <button onClick={() => navigate('allowlist')} className="hover:text-red-300 text-sm">Allowlist</button>
        <button onClick={() => navigate('precommit')} className="hover:text-red-300 text-sm">Pre-Commit</button>
        <button onClick={() => navigate('reports')} className="hover:text-red-300 text-sm">Reports</button>
      </nav>
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {currentPage === 'scan' && <ScanPage onScanComplete={(id) => { setScanRunId(id); navigate('dashboard'); }} />}
        {currentPage === 'dashboard' && <DashboardPage scanRunId={scanRunId} onSelectFinding={(id) => navigate('finding-detail', id)} />}
        {currentPage === 'finding-detail' && selectedFindingId && <FindingDetailPage findingId={selectedFindingId} />}
        {currentPage === 'rotation' && <RotationChecklistsPage />}
        {currentPage === 'allowlist' && <AllowlistPage />}
        {currentPage === 'precommit' && <PreCommitPage />}
        {currentPage === 'reports' && <ReportsPage scanRunId={scanRunId} />}
      </main>
    </div>
  );
}
