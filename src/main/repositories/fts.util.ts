export function sanitizeFtsQuery(query: string): string {
  if (!query) return '';
  // Strip double-quotes, colons, wildcards, and special SQLite FTS5 operators
  const clean = query.replace(/["*:()]/g, '').trim();
  if (!clean) return '';
  // Split into words, filter empty terms, and append prefix wildcard * to each word
  return clean
    .split(/\s+/)
    .filter(Boolean)
    .map(word => `${word}*`)
    .join(' ');
}
