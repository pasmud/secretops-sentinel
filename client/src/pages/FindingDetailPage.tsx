import { useState, useEffect } from 'react';
import { api, Finding, WorkflowEvent } from '../utils/api';

interface Props {
  findingId: string;
}

const stateOptions = ['detected', 'confirmed', 'revoked', 'rotated', 'history_cleaned', 'closed', 'false_positive'];

export default function FindingDetailPage({ findingId }: Props) {
  const [finding, setFinding] = useState<Finding | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetState, setTargetState] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadFinding();
  }, [findingId]);

  const loadFinding = async () => {
    try {
      const result = await api.getFinding(findingId);
      setFinding(result.finding);
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async () => {
    if (!targetState) return;
    try {
      await api.updateFindingState(findingId, targetState, note || undefined);
      setTargetState('');
      setNote('');
      loadFinding();
    } catch (e: any) {
      setError(e.message);
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

  if (loading) return <p>Loading...</p>;
  if (!finding) return <p className="text-red-500">Finding not found</p>;

  const allowedNext = {
    detected: ['confirmed', 'false_positive'],
    confirmed: ['revoked', 'false_positive'],
    revoked: ['rotated', 'false_positive'],
    rotated: ['history_cleaned', 'false_positive'],
    history_cleaned: ['closed', 'false_positive'],
    closed: [],
    false_positive: [],
  }[finding.workflowState] || [];

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Finding Detail</h2>

      {error && <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded text-sm">{error}</div>}

      <div className="grid grid-cols-2 gap-4 bg-white border rounded p-4">
        <div><span className="text-gray-500 text-sm">Secret Type</span><p className="font-medium">{finding.secretType}</p></div>
        <div><span className="text-gray-500 text-sm">Severity</span><p><span className={`px-2 py-0.5 rounded text-xs font-medium ${severityColor(finding.severity)}`}>{finding.severity}</span></p></div>
        <div className="col-span-2"><span className="text-gray-500 text-sm">File</span><p className="font-mono text-sm">{finding.filePath}:{finding.lineNumber}</p></div>
        <div className="col-span-2"><span className="text-gray-500 text-sm">Commit</span><p className="font-mono text-sm">{finding.commitSHA}</p></div>
        <div className="col-span-2"><span className="text-gray-500 text-sm">Redacted Match</span><p className="font-mono text-sm bg-yellow-50 p-2 rounded border">{finding.redactedMatch}</p></div>
        <div><span className="text-gray-500 text-sm">Current Status</span><p className="font-medium capitalize">{finding.workflowState.replace('_', ' ')}</p></div>
      </div>

      {allowedNext.length > 0 && (
        <div className="bg-white border rounded p-4 space-y-3">
          <h3 className="font-bold">Update Status</h3>
          <div className="flex gap-2">
            <select value={targetState} onChange={e => setTargetState(e.target.value)} className="border rounded px-3 py-2 flex-1">
              <option value="">Select next state...</option>
              {allowedNext.map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Add a note (optional)..."
              className="w-full border rounded px-3 py-2 text-sm"
              rows={2}
            />
          </div>
          <button
            onClick={handleTransition}
            disabled={!targetState}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            Update Status
          </button>
        </div>
      )}

      {finding.events && finding.events.length > 0 && (
        <div className="bg-white border rounded p-4">
          <h3 className="font-bold mb-3">Workflow Timeline</h3>
          <div className="space-y-2">
            {finding.events.map((e: WorkflowEvent) => (
              <div key={e.id} className="flex items-start gap-3 text-sm border-b pb-2">
                <div className="bg-gray-100 rounded px-2 py-1 text-xs font-mono whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">{e.fromState || 'start'}</span>
                  <span className="mx-1">→</span>
                  <span className="font-medium">{e.toState}</span>
                  {e.note && <p className="text-gray-500 text-xs mt-0.5">{e.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {finding.rotationChecklist && (
        <div className="bg-white border rounded p-4">
          <h3 className="font-bold mb-2">Rotation Checklist</h3>
          {(() => {
            const steps = JSON.parse(finding.rotationChecklist.steps);
            return (
              <ul className="list-decimal ml-5 text-sm space-y-1">
                {steps.map((s: any, i: number) => (
                  <li key={i} className={s.verified ? 'line-through text-gray-400' : ''}>{s.description}</li>
                ))}
              </ul>
            );
          })()}
        </div>
      )}
    </div>
  );
}
