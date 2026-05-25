import { execSync } from 'child_process';
import { existsSync } from 'fs';

export interface GitleaksFinding {
  RuleID: string;
  Description: string;
  File: string;
  Line: number;
  Commit: string;
  Match: string;
  Secret: string;
  Severity: string;
  Author: string;
  Email: string;
  Date: string;
}

export interface GitleaksResult {
  findings: GitleaksFinding[];
  error?: string;
}

export function checkGitleaksInstalled(): boolean {
  try {
    execSync('gitleaks version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function runGitleaksScan(repoPath: string): GitleaksResult {
  if (!existsSync(repoPath)) {
    return { findings: [], error: `Path does not exist: ${repoPath}` };
  }

  try {
    const output = execSync(
      `gitleaks detect --source "${repoPath}" --report-format json --report-path /dev/stdout --no-color 2>/dev/null || true`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );

    const lines = output.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) {
      return { findings: [] };
    }

    const raw = JSON.parse(lines[0]);
    const findings: GitleaksFinding[] = Array.isArray(raw)
      ? raw
      : raw.Vulnerabilities || raw.findings || [];

    return { findings };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes('command not found') || message.includes('not recognized')) {
      return { findings: [], error: 'Gitleaks is not installed. See https://github.com/gitleaks/gitleaks for installation.' };
    }
    return { findings: [], error: message };
  }
}

export function getGitleaksVersion(): string | null {
  try {
    const out = execSync('gitleaks version', { encoding: 'utf-8' });
    return out.trim();
  } catch {
    return null;
  }
}
