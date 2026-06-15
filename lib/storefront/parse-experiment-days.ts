const ALLOWED = new Set([7, 14, 30]);

/** Advanced dashboard `?days=` query (7 | 14 | 30). */
export function parseExperimentDaysParam(raw: string | undefined): number {
  const n = Number(raw);
  if (ALLOWED.has(n)) return n;
  return 30;
}
