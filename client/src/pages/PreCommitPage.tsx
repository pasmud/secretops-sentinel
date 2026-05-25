import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function PreCommitPage() {
  const [instructions, setInstructions] = useState<any>(null);
  const [platform, setPlatform] = useState('');

  useEffect(() => {
    api.getPrecommitInstructions().then(r => {
      setInstructions(r.instructions);
      setPlatform(r.platform);
    }).catch(() => {});
  }, []);

  const handleDownloadScript = async () => {
    try {
      const script = await api.getPrecommitScript();
      const blob = new Blob([script], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pre-commit';
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Pre-Commit Hook Setup</h2>
      <p className="text-gray-600">
        Set up Gitleaks as a pre-commit hook to automatically scan staged changes before each commit.
        This catches secrets before they enter git history.
      </p>

      {instructions && (
        <div className="bg-white border rounded p-4 space-y-4">
          <h3 className="font-bold">Setup Instructions ({platform})</h3>
          <ol className="space-y-3">
            {instructions.steps.map((step: any, i: number) => (
              <li key={i} className="text-sm">
                <p className="font-medium">{step.title}</p>
                <pre className="bg-gray-50 p-2 rounded mt-1 text-xs overflow-x-auto">{step.command}</pre>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-sm font-medium text-yellow-800">Important Notes</p>
        <ul className="list-disc ml-5 text-sm text-yellow-700 mt-1 space-y-1">
          <li>Pre-commit hooks can be bypassed with <code className="bg-yellow-100 px-1">git commit --no-verify</code></li>
          <li>Always pair pre-commit hooks with CI/CD scanning for enforcement</li>
          <li>Run <code className="bg-yellow-100 px-1">gitleaks detect</code> on your full history as a one-time audit first</li>
          <li>Use a <code className="bg-yellow-100 px-1">.gitleaks.toml</code> file for project-specific allowlists and rules</li>
        </ul>
      </div>

      <button
        onClick={handleDownloadScript}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
      >
        Download Pre-Commit Script
      </button>
    </div>
  );
}
