import { describe, it, expect } from 'vitest';
import { isValidTransition } from './workflow.js';

describe('isValidTransition', () => {
  it('allows detected -> confirmed', () => {
    expect(isValidTransition('detected', 'confirmed')).toBe(true);
  });

  it('allows detected -> false_positive', () => {
    expect(isValidTransition('detected', 'false_positive')).toBe(true);
  });

  it('allows confirmed -> revoked', () => {
    expect(isValidTransition('confirmed', 'revoked')).toBe(true);
  });

  it('rejects detected -> closed', () => {
    expect(isValidTransition('detected', 'closed')).toBe(false);
  });

  it('rejects closed -> any', () => {
    expect(isValidTransition('closed', 'revoked')).toBe(false);
  });

  it('rejects unknown states', () => {
    expect(isValidTransition('detected', 'unknown')).toBe(false);
    expect(isValidTransition('unknown', 'detected')).toBe(false);
  });

  it('allows full remediation path', () => {
    const path = ['detected', 'confirmed', 'revoked', 'rotated', 'history_cleaned', 'closed'];
    for (let i = 0; i < path.length - 1; i++) {
      expect(isValidTransition(path[i], path[i + 1])).toBe(true);
    }
  });
});
