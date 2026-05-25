import { describe, it, expect } from 'vitest';
import { getDemoFindings } from './demo.js';

describe('getDemoFindings', () => {
  it('returns demo findings', () => {
    const demo = getDemoFindings();
    expect(demo.findings.length).toBeGreaterThan(0);
    expect(demo.repoPath).toBe('demo-fixture');
  });

  it('all secrets start with FAKE_TEST_ONLY_', () => {
    const demo = getDemoFindings();
    for (const f of demo.findings) {
      expect(f.Secret.startsWith('FAKE_TEST_ONLY_')).toBe(true);
    }
  });

  it('has various secret types', () => {
    const demo = getDemoFindings();
    const types = demo.findings.map(f => f.RuleID);
    expect(types).toContain('aws-access-key');
    expect(types).toContain('github-pat');
    expect(types).toContain('stripe-key');
    expect(types).toContain('openai-key');
  });
});
