const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  if (res.headers.get('content-type')?.includes('application/json')) {
    return res.json();
  }
  return res.text() as unknown as T;
}

export interface Finding {
  id: string;
  scanRunId: string;
  ruleId: string;
  secretType: string;
  filePath: string;
  lineNumber: number;
  commitSHA: string;
  redactedMatch: string;
  severity: string;
  confidence: string;
  workflowState: string;
  createdAt: string;
  updatedAt: string;
  events?: WorkflowEvent[];
  allowlistSuggestion?: any;
  rotationChecklist?: any;
}

export interface WorkflowEvent {
  id: string;
  findingId: string;
  fromState: string | null;
  toState: string;
  note: string | null;
  createdAt: string;
}

export interface ScanResult {
  scanRunId: string;
  totalFindings: number;
  findings: Finding[];
}

export const api = {
  scan: (repoPath: string, useDemo = false) =>
    request<ScanResult>('/scan', {
      method: 'POST',
      body: JSON.stringify({ repoPath, useDemo }),
    }),

  getFindings: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ findings: Finding[] }>(`/findings${qs}`);
  },

  getFinding: (id: string) =>
    request<{ finding: Finding }>(`/findings/${id}`),

  updateFindingState: (id: string, workflowState: string, note?: string) =>
    request<{ finding: Finding }>(`/findings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ workflowState, note }),
    }),

  getStates: () =>
    request<{ states: string[] }>('/findings/states/available'),

  getAllowlistSuggestions: () =>
    request<{ suggestions: any[] }>('/allowlist'),

  acceptAllowlist: (id: string) =>
    request<{ suggestion: any }>(`/allowlist/${id}/accept`, { method: 'PATCH' }),

  exportAllowlist: () =>
    request<string>('/allowlist/export'),

  getRotationChecklist: (type: string) =>
    request<{ checklist: any }>(`/rotation/${type}`),

  getRotationTypes: () =>
    request<{ types: string[] }>('/rotation/types'),

  exportReport: async (scanRunId?: string) => {
    const res = await fetch(`${BASE}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scanRunId }),
    });
    return res.text();
  },

  checkGitleaks: () =>
    request<{ installed: boolean; version: string | null; installUrl: string }>('/gitleaks/check'),

  getPrecommitInstructions: () =>
    request<{ instructions: any; platform: string }>('/precommit'),

  getPrecommitScript: () =>
    request<string>('/precommit/script'),
};
