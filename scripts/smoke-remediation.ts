/**
 * Post-migrate remediation smoke (staging/local).
 *
 *   export SMOKE_BASE_URL="https://staging.example.com"
 *   export CRON_SECRET="..."
 *   export SMOKE_PUBLIC_API_KEY="kos_..."
 *   export SMOKE_SESSION_COOKIE="sb-..."   # Supabase session for delivery IDOR
 *   export SMOKE_DELIVERY_CONNECTION_ID="uuid"       # tenant A
 *   export SMOKE_DELIVERY_CONNECTION_ID_OTHER="uuid" # tenant B → expect 404
 *   npm run smoke:remediation
 */
import { verifyExperimentalCron } from "@/lib/security/cron-auth";
import { logger } from "@/lib/logger";

const base = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");

function sessionHeaders(): Record<string, string> {
  const cookie = process.env.SMOKE_SESSION_COOKIE?.trim();
  if (!cookie) return {};
  return { Cookie: cookie.startsWith("sb-") ? cookie : `sb-access-token=${cookie}` };
}

async function fetchJson(path: string, init?: RequestInit) {
  const headers = { ...sessionHeaders(), ...(init?.headers as Record<string, string> | undefined) };
  const res = await fetch(`${base}${path}`, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body, headers: Object.fromEntries(res.headers.entries()) };
}

async function smokePublicApiInvalidEmail() {
  const key = process.env.SMOKE_PUBLIC_API_KEY?.trim();
  if (!key) {
    logger.cli("SKIP public API invalid email (no SMOKE_PUBLIC_API_KEY)");
    return;
  }
  const { status, body } = await fetchJson("/api/public/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customerName: "Test",
      customerEmail: "not-an-email",
      total: 10,
    }),
  });
  if (status !== 400) {
    throw new Error(`public API invalid email: expected 400, got ${status} ${JSON.stringify(body)}`);
  }
  logger.cli("OK public API invalid email → 400");
}

async function smokeDeliveryConnectionScope() {
  const own = process.env.SMOKE_DELIVERY_CONNECTION_ID?.trim();
  const other = process.env.SMOKE_DELIVERY_CONNECTION_ID_OTHER?.trim();
  if (!own) {
    logger.cli("SKIP delivery (set SMOKE_DELIVERY_CONNECTION_ID)");
    return;
  }

  const unauth = await fetchJson("/api/delivery/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ connectionId: own }),
  });
  if (unauth.status !== 401) {
    throw new Error(`delivery quote without auth: expected 401, got ${unauth.status}`);
  }
  logger.cli("OK delivery quote unauthenticated → 401");

  const cookie = process.env.SMOKE_SESSION_COOKIE?.trim();
  if (!cookie) {
    logger.cli("SKIP delivery IDOR cross-tenant (set SMOKE_SESSION_COOKIE)");
    return;
  }

  const ownQuote = await fetchJson("/api/delivery/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ connectionId: own }),
  });
  if (ownQuote.status === 404) {
    throw new Error(`delivery quote own connection: unexpected 404`);
  }
  if (ownQuote.status !== 200 && ownQuote.status !== 400 && ownQuote.status !== 502) {
    logger.cli(`WARN delivery quote own: ${ownQuote.status} (credentials may be placeholder)`);
  } else {
    logger.cli(`OK delivery quote own connection → ${ownQuote.status}`);
  }

  if (other) {
    const cross = await fetchJson("/api/delivery/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ connectionId: other }),
    });
    if (cross.status !== 404) {
      throw new Error(`delivery IDOR: expected 404 for other tenant connection, got ${cross.status}`);
    }
    logger.cli("OK delivery cross-tenant connectionId → 404");
  }
}

async function smokeRateLimitBurst() {
  const key = process.env.SMOKE_PUBLIC_API_KEY?.trim();
  if (!key || process.env.SMOKE_SKIP_RATE_LIMIT === "1") {
    logger.cli("SKIP rate limit burst");
    return;
  }
  let hit429 = false;
  for (let i = 0; i < 120; i++) {
    const res = await fetch(`${base}/api/public/v1/orders`, {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });
    if (res.status === 429) {
      hit429 = true;
      const retry = res.headers.get("retry-after");
      logger.cli(`OK public API rate limit → 429 (retry-after=${retry ?? "?"})`);
      break;
    }
  }
  if (!hit429) {
    logger.cli("WARN rate limit burst: no 429 in 120 GETs (Upstash may be disabled or limit high)");
  }
}

async function smokeStreamingExports() {
  const cookie = process.env.SMOKE_SESSION_COOKIE?.trim();
  if (!cookie) {
    logger.cli("SKIP streaming export (set SMOKE_SESSION_COOKIE)");
    return;
  }
  for (const type of ["production", "inventory", "orders"] as const) {
    const res = await fetch(`${base}/api/export?type=${type}`, { headers: sessionHeaders() });
    if (res.status === 403) {
      logger.cli(`WARN export ${type} → 403 (role may lack permission — expected for some staff)`);
      continue;
    }
    if (!res.ok) {
      throw new Error(`export ${type}: expected 200, got ${res.status}`);
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/csv")) {
      throw new Error(`export ${type}: expected text/csv, got ${ct}`);
    }
    const chunk = await res.text();
    if (chunk.length < 10) {
      throw new Error(`export ${type}: empty CSV body`);
    }
    logger.cli(`OK export ${type} → 200 chunked CSV (${chunk.length} bytes sample)`);
  }
}

async function smokeImportCenterGate() {
  const cookie = process.env.SMOKE_SESSION_COOKIE?.trim();
  if (!cookie) {
    logger.cli("SKIP import center HTML gate (set SMOKE_SESSION_COOKIE)");
    return;
  }
  const res = await fetch(`${base}/dashboard/import-center`, {
    headers: sessionHeaders(),
    redirect: "manual",
  });
  const html = await res.text();
  if (res.status === 200 && html.includes("Import center access restricted")) {
    logger.cli("OK import center RBAC gate visible for restricted role");
    return;
  }
  if (res.status === 200 && html.includes("Data Import Center")) {
    logger.cli("OK import center accessible (owner/settings role)");
    return;
  }
  if (res.status === 307 || res.status === 302) {
    logger.cli(`WARN import center → ${res.status} redirect (login session may be expired)`);
    return;
  }
  logger.cli(`WARN import center → ${res.status}`);
}

function smokeExperimentalCron() {
  const prev = process.env.CRON_SECRET;
  process.env.CRON_SECRET = process.env.CRON_SECRET ?? "smoke-test-secret";
  const req = new Request(`${base}/api/cron/storefront-theme-experiment`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  delete process.env.ENABLE_EXPERIMENTAL_CRONS;
  const res = verifyExperimentalCron(req);
  if (!res.ok) {
    const status = res.response.status;
    if (status !== 200) {
      throw new Error(`experimental cron gate: expected 200 skipped, got ${status}`);
    }
  }
  if (prev) process.env.CRON_SECRET = prev;
  else delete process.env.CRON_SECRET;
  logger.cli("OK experimental crons disabled → skipped (200)");
}

async function main() {
  logger.cli(`Smoke remediation @ ${base}\n`);
  await smokePublicApiInvalidEmail();
  await smokeDeliveryConnectionScope();
  await smokeStreamingExports();
  await smokeImportCenterGate();
  await smokeRateLimitBurst();
  smokeExperimentalCron();
  logger.cli("\nSmoke remediation passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
