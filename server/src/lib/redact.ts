export function redactSecret(value: string): string {
  if (!value || value.length <= 8) {
    return value.length <= 4 ? value : value.slice(0, 4) + '...';
  }
  return value.slice(0, 4) + '...' + value.slice(-4);
}

export function truncateCommit(sha: string): string {
  if (!sha) return '';
  return sha.slice(0, 8);
}
