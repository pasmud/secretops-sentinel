import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function AllowlistPage() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const result = await api.getAllowlistSuggestions();
      setSuggestions(result.suggestions);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.acceptAllowlist(id);
      loadSuggestions();
    } catch {}
  };

  const handleExport = async () => {
    try {
      const toml = await api.exportAllowlist();
      const blob = new Blob([toml], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '.gitleaks.toml';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Allowlist Suggestions</h2>
        {suggestions.length > 0 && (
          <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
            Export .gitleaks.toml
          </button>
        )}
      </div>
      <p className="text-gray-600 text-sm">
        False positive findings can be added to a Gitleaks allowlist. Review each suggestion before accepting.
      </p>

      {suggestions.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded text-center text-gray-500">
          No allowlist suggestions yet. Mark findings as false positive to generate suggestions.
        </div>
      ) : (
        <div className="space-y-3">
          {suggestions.map(s => (
            <div key={s.id} className={`border rounded p-4 ${s.accepted ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{s.ruleId}</p>
                  <p className="text-xs text-gray-500">Path: {s.allowlistValue}</p>
                  <p className="text-xs text-gray-500">Match: {s.matchValue}</p>
                  <p className="text-xs text-gray-500">Rationale: {s.rationale}</p>
                </div>
                {!s.accepted && (
                  <button
                    onClick={() => handleAccept(s.id)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Accept
                  </button>
                )}
                {s.accepted && (
                  <span className="text-green-600 text-xs font-medium bg-green-100 px-2 py-1 rounded">Accepted</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
