const validTransitions: Record<string, string[]> = {
  detected: ['confirmed', 'false_positive'],
  confirmed: ['revoked', 'false_positive'],
  revoked: ['rotated', 'false_positive'],
  rotated: ['history_cleaned', 'false_positive'],
  history_cleaned: ['closed', 'false_positive'],
  closed: [],
  false_positive: [],
};

export function isValidTransition(from: string, to: string): boolean {
  const allowed = validTransitions[from];
  if (!allowed) return false;
  return allowed.includes(to);
}
