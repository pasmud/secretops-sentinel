import { useState, useEffect } from 'react';
import { api } from '../utils/api';

interface Props {
  onScanComplete: (scanRunId: string) => void;
}

export default function ScanPage({ onScanComplete }: Props) {
  const [repoPath, setRepoPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gitleaksInfo, setGitleaksInfo] = useState<{ installed: boolean; version: string | null; installUrl: string } | null>(null);

  useEffect(() => {
    api.checkGitleaks().then(setGitleaksInfo).catch(() => {});
  }, []);

  const handleScan = async () => {
    if (!repoPath && !loading) return;
    setLoading(true);
    setError('');
    try {
      const result = await api.scan(repoPath, false);
      onScanComplete(result.scanRunId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScanDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.scan('', true);
      onScanComplete(result.scanRunId);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Scan Repository</h2>
        <p className="text-gray-600">Enter a local repository path to scan for secrets, or use the demo fixture.</p>
      </div>

      {gitleaksInfo && (
        <div className={`p-3 rounded ${gitleaksInfo.installed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {gitleaksInfo.installed
            ? `Gitleaks is installed: ${gitleaksInfo.version}`
            : `Gitleaks is not installed. Install from ${gitleaksInfo.installUrl}`}
        </div>
      )}

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Repository Path</label>
          <input
            type="text"
            value={repoPath}
            onChange={e => setRepoPath(e.target.value)}
            placeholder="C:\projects\my-repo"
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={handleScan}
          disabled={loading || !repoPath}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </div>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-500 mb-2">No repo path? Scan the demo fixture with fake test secrets.</p>
        <button
          onClick={handleScanDemo}
          disabled={loading}
          className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? 'Scanning...' : 'Scan Demo Fixture'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded">
          {error}
          {error.includes('not installed') && (
            <div className="mt-2">
              <p className="text-sm">You can either:</p>
              <ol className="list-decimal ml-5 text-sm mt-1">
                <li>Install Gitleaks from <a href="https://github.com/gitleaks/gitleaks" className="underline">github.com/gitleaks/gitleaks</a></li>
                <li>Use the <strong>Scan Demo Fixture</strong> button above to see the tool in action</li>
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
