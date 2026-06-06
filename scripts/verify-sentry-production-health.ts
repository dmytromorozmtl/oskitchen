/**
 * Verify production Sentry is live via /api/health.
 *
 * Usage:
 *   npm run sentry:production:verify
 *   tsx scripts/verify-sentry-production-health.ts https://os-kitchen.com/api/health
 */
const DEFAULT_HEALTH_URL = "https://os-kitchen.com/api/health";

type SentryServerCheck = {
  ok?: boolean;
  configured?: boolean;
  status?: string;
};

export function parseSentryServerCheck(payload: unknown): SentryServerCheck | null {
  if (!payload || typeof payload !== "object") return null;
  const checks = (payload as { checks?: unknown }).checks;
  if (!checks || typeof checks !== "object") return null;
  const sentry = (checks as { sentryServer?: unknown }).sentryServer;
  if (!sentry || typeof sentry !== "object") return null;
  return sentry as SentryServerCheck;
}

export function evaluateSentryProductionHealth(sentry: SentryServerCheck | null): {
  ok: boolean;
  lines: string[];
} {
  const lines: string[] = [];
  if (!sentry) {
    lines.push("sentryServer=missing");
    return { ok: false, lines };
  }
  lines.push(`sentryServer.status=${sentry.status ?? "unknown"}`);
  lines.push(`sentryServer.configured=${String(Boolean(sentry.configured))}`);
  lines.push(`sentryServer.ok=${String(Boolean(sentry.ok))}`);
  return { ok: Boolean(sentry.ok), lines };
}

async function main() {
  const url = process.argv[2]?.trim() || process.env.SENTRY_VERIFY_HEALTH_URL?.trim() || DEFAULT_HEALTH_URL;

  let response: Response;
  try {
    response = await fetch(url, { headers: { accept: "application/json" }, cache: "no-store" });
  } catch (error) {
    console.error(`sentry.verify.fetch_error=${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    console.error("sentry.verify.invalid_json=1");
    process.exit(1);
  }

  const sentry = parseSentryServerCheck(payload);
  const result = evaluateSentryProductionHealth(sentry);

  console.log(`sentry.verify.url=${url}`);
  console.log(`sentry.verify.httpStatus=${response.status}`);
  for (const line of result.lines) {
    console.log(`sentry.verify.${line}`);
  }

  if (!response.ok || !result.ok) {
    console.error(
      "\nSentry production is NOT live. Activate with:\n  SENTRY_DSN=https://... npm run sentry:production:activate -- --apply --deploy --mirror-public-dsn\nThen configure error-rate alert (>1%) — docs/SENTRY_ALERT_RULES.md §6",
    );
    process.exit(1);
  }

  console.log("\nSentry production health check PASSED.");
}

void main();
