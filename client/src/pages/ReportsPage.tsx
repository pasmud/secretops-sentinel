import { useState } from 'react';
import { api } from '../utils/api';

interface Props {
  scanRunId: string | null;
}

export default function ReportsPage({ scanRunId }: Props) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const report = await api.exportReport(scanRunId || undefined);
      const blob = new Blob([report], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `incident-report-${new Date().toISOString().slice(0, 10)}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Incident Reports</h2>
      <p className="text-gray-600">
        Export an incident-style Markdown report of all findings and their remediation status.
      </p>

      {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded text-sm">{error}</div>}

      <button
        onClick={handleExport}
        disabled={exporting}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {exporting ? 'Generating...' : 'Export Incident Report'}
      </button>

      <div className="bg-gray-50 border rounded p-4 text-sm text-gray-600">
        <p className="font-medium mb-1">Report includes:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Summary with severity counts</li>
          <li>Findings table with redacted matches</li>
          <li>Workflow timeline for each finding</li>
          <li>Remediation recommendations</li>
          <li>Safety notice</li>
        </ul>
      </div>
    </div>
  );
}
