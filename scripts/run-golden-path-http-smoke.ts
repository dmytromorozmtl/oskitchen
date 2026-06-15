/**
 * Automated HTTP smoke for paid pilot (no browser).
 *
 *   SMOKE_BASE_URL=https://staging.example.com npx tsx scripts/run-golden-path-http-smoke.ts
 */
type Check = { id: string; ok: boolean; detail: string };

function baseUrl(): string {
  const u =
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.PLAYWRIGHT_BASE_URL?.trim();
  if (!u) {
    console.error("Set SMOKE_BASE_URL or NEXT_PUBLIC_APP_URL");
    process.exit(1);
  }
  const normalized = u.replace(/\/$/, "");
  if (
    normalized.includes("yourdomain.com") ||
    normalized.includes("example.com") ||
    normalized === "http://localhost:3000"
  ) {
    console.warn(
      `SKIP: ${normalized} is a placeholder — set SMOKE_BASE_URL to deployed staging URL`,
    );
    process.exit(0);
  }
  return normalized;
}

async function get(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${baseUrl()}${path}`, { ...init, redirect: "manual" });
}

async function main() {
  const checks: Check[] = [];

  async function run(id: string, fn: () => Promise<void>) {
    try {
      await fn();
      checks.push({ id, ok: true, detail: "OK" });
    } catch (e) {
      checks.push({
        id,
        ok: false,
        detail: e instanceof Error ? e.message : String(e),
      });
    }
  }

  await run("login-page", async () => {
    const res = await get("/login");
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await run("health", async () => {
    const res = await get("/api/health");
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
  });

  await run("cron-unauthorized", async () => {
    const res = await get("/api/cron/webhook-jobs");
    if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
  });

  await run("cron-with-secret", async () => {
    const secret = process.env.CRON_SECRET?.trim();
    if (!secret) throw new Error("CRON_SECRET unset — skip or set for this check");
    const res = await get("/api/cron/webhook-jobs", {
      headers: { Authorization: `Bearer ${secret}` },
    });
    if (res.status !== 200 && res.status !== 204) {
      throw new Error(`expected 200/204, got ${res.status}`);
    }
  });

  await run("marketing-claims", async () => {
    const res = await get("/");
    if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
  });

  console.log(`=== Golden path HTTP smoke — ${baseUrl()} ===\n`);
  let fail = 0;
  for (const c of checks) {
    const tag = c.ok ? "OK" : "FAIL";
    console.log(`${tag.padEnd(5)} ${c.id}: ${c.detail}`);
    if (!c.ok) fail++;
  }
  console.log("");
  if (fail > 0) {
    console.error(`${fail} check(s) failed. See docs/PILOT_GOLDEN_PATH_CHECKLIST.md for manual UI steps.`);
    process.exit(1);
  }
  const { mkdirSync, writeFileSync } = await import("node:fs");
  const { join } = await import("node:path");
  const marker = join(process.cwd(), "docs/generated/PILOT_HTTP_SMOKE_OK");
  mkdirSync(join(process.cwd(), "docs/generated"), { recursive: true });
  writeFileSync(
    marker,
    JSON.stringify({ ok: true, baseUrl: baseUrl(), at: new Date().toISOString() }, null, 2),
    "utf8",
  );
  console.log("HTTP smoke passed. Complete manual checklist for staff + checkout flows.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
