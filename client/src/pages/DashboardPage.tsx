import { useState, useEffect } from 'react';
import { api, Finding } from '../utils/api';

interface Props {
  scanRunId: string | null;
  onSelectFinding: (id: string) => void;
}

export default function DashboardPage({ scanRunId, onSelectFinding }: Props) {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  useEffect(() => {
    loadFindings();
  }, [scanRunId]);

  const loadFindings = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (scanRunId) params.scanRunId = scanRunId;
      if (filterState) params.status = filterState;
      if (filterSeverity) params.severity = filterSeverity;
      const result = await api.getFindings(params);
      setFindings(result.findings);
    } catch {
      setFindings([]);
    } finally {
      setLoading(false);
    }
  };

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stateColor = (s: string) => {
    switch (s) {
      case 'detected': return 'bg-purple-100 text-purple-800';
      case 'confirmed': return 'bg-red-100 text-red-800';
      case 'revoked': return 'bg-orange-100 text-orange-800';
      case 'rotated': return 'bg-blue-100 text-blue-800';
      case 'history_cleaned': return 'bg-teal-100 text-teal-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Findings Dashboard</h2>
        <div className="flex gap-2">
          <select value={filterState} onChange={e => { setFilterState(e.target.value); }} className="border rounded px-2 py-1 text-sm">
            <option value="">All States</option>
            <option value="detected">Detected</option>
            <option value="confirmed">Confirmed</option>
            <option value="revoked">Revoked</option>
            <option value="rotated">Rotated</option>
            <option value="history_cleaned">History Cleaned</option>
            <option value="closed">Closed</option>
            <option value="false_positive">False Positive</option>
          </select>
          <select value={filterSeverity} onChange={e => { setFilterSeverity(e.target.value); }} className="border rounded px-2 py-1 text-sm">
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button onClick={loadFindings} className="bg-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-300">Refresh</button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : findings.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
          No findings yet. Run a scan first.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm">
                <th className="p-2">Secret Type</th>
                <th className="p-2">File</th>
                <th className="p-2">Line</th>
                <th className="p-2">Commit</th>
                <th className="p-2">Match</th>
                <th className="p-2">Severity</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {findings.map(f => (
                <tr
                  key={f.id}
                  className="border-t hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => onSelectFinding(f.id)}
                >
                  <td className="p-2 font-medium">{f.secretType}</td>
                  <td className="p-2 text-gray-600 max-w-xs truncate">{f.filePath}</td>
                  <td className="p-2">{f.lineNumber}</td>
                  <td className="p-2 font-mono text-xs">{f.commitSHA}</td>
                  <td className="p-2 font-mono text-xs">{f.redactedMatch}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColor(f.severity)}`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${stateColor(f.workflowState)}`}>
                      {f.workflowState.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
