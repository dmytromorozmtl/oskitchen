/** Fuzzy column mapping from CSV headers to canonical field keys. */
export function suggestColumnMapping(
  headers: string[],
  targets: readonly string[],
): Record<string, string> {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
  const headerNorm = headers.map((h) => ({ raw: h, n: norm(h) }));
  const out: Record<string, string> = {};
  for (const t of targets) {
    const tn = norm(t);
    const hit = headerNorm.find((h) => h.n === tn || h.n === `${tn}name` || h.n.endsWith(tn));
    if (hit) out[t] = hit.raw;
  }
  return out;
}

export function invertMapping(canonicalToCsv: Record<string, string>): Record<string, string> {
  const inv: Record<string, string> = {};
  for (const [k, v] of Object.entries(canonicalToCsv)) {
    if (v) inv[v] = k;
  }
  return inv;
}
