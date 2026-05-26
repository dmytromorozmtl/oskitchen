export type HealthSummary = {
  ok: boolean;
  status: string | null;
  databaseOk: boolean | null;
  databaseLatencyMs: number | null;
  rateLimitMode: string | null;
  startupReadinessOk: boolean | null;
  lines: string[];
};

export function summariseHealthPayload(payload: unknown): HealthSummary {
  const obj =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const checks =
    obj.checks && typeof obj.checks === "object" && !Array.isArray(obj.checks)
      ? (obj.checks as Record<string, unknown>)
      : {};
  const database =
    checks.database && typeof checks.database === "object" && !Array.isArray(checks.database)
      ? (checks.database as Record<string, unknown>)
      : {};
  const rateLimit =
    checks.rateLimitAdapter && typeof checks.rateLimitAdapter === "object" && !Array.isArray(checks.rateLimitAdapter)
      ? (checks.rateLimitAdapter as Record<string, unknown>)
      : {};
  const startupReadiness =
    checks.startupReadiness &&
    typeof checks.startupReadiness === "object" &&
    !Array.isArray(checks.startupReadiness)
      ? (checks.startupReadiness as Record<string, unknown>)
      : {};

  const status = typeof obj.status === "string" ? obj.status : null;
  const databaseOk = typeof database.ok === "boolean" ? database.ok : null;
  const databaseLatencyMs =
    typeof database.latencyMs === "number" ? database.latencyMs : null;
  const rateLimitMode =
    typeof rateLimit.mode === "string"
      ? rateLimit.mode
      : typeof rateLimit.adapter === "string"
        ? rateLimit.adapter
        : null;
  const startupReadinessOk =
    typeof startupReadiness.ok === "boolean" ? startupReadiness.ok : null;

  return {
    ok: status === "ok",
    status,
    databaseOk,
    databaseLatencyMs,
    rateLimitMode,
    startupReadinessOk,
    lines: [
      `status=${status ?? "unknown"}`,
      `database.ok=${databaseOk === null ? "unknown" : String(databaseOk)}`,
      `database.latencyMs=${databaseLatencyMs ?? "n/a"}`,
      `rateLimit.mode=${rateLimitMode ?? "unknown"}`,
      `startupReadiness.ok=${startupReadinessOk === null ? "unknown" : String(startupReadinessOk)}`,
    ],
  };
}
