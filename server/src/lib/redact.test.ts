import { describe, it, expect } from 'vitest';
import { redactSecret, truncateCommit } from './redact.js';

describe('redactSecret', () => {
  it('redacts long secrets', () => {
    expect(redactSecret('AKIAIOSFODNN7EXAMPLE')).toBe('AKIA...MPLE');
  });

  it('handles short secrets', () => {
    expect(redactSecret('abc')).toBe('abc');
    expect(redactSecret('abcdefgh')).toBe('abcd...');
  });

  it('handles empty input', () => {
    expect(redactSecret('')).toBe('');
  });
});

describe('truncateCommit', () => {
  it('truncates to 8 chars', () => {
    expect(truncateCommit('a1b2c3d4e5f6g7h8')).toBe('a1b2c3d4');
  });

  it('handles empty input', () => {
    expect(truncateCommit('')).toBe('');
  });
});
