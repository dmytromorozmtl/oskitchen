/**
 * Aggregate pilot readiness into a single GO/NO-GO status artifact.
 *
 *   npm run pilot:go-no-go-report
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadStagingPilotEnv } from "./lib/load-dotenv-file";

type Row = { id: string; area: string; status: "GO" | "WARN" | "BLOCKED"; evidence: string };

function run(cmd: string): { ok: boolean; out: string } {
  try {
    const out = execSync(cmd, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" },
    });
    return { ok: true, out: out.trim() };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      out: [err.stdout, err.stderr, err.message].filter(Boolean).join("\n").trim(),
    };
  }
}

function envSet(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

function main() {
  loadStagingPilotEnv();

  const rows: Row[] = [];

  const typecheck = run("npm run typecheck");
  rows.push({
    id: "CODE-01",
    area: "Typecheck",
    status: typecheck.ok ? "GO" : "BLOCKED",
    evidence: typecheck.ok ? "npm run typecheck" : typecheck.out.slice(0, 200),
  });

  const tests = run("npm test");
  rows.push({
    id: "CODE-02",
    area: "Unit tests",
    status: tests.ok ? "GO" : "BLOCKED",
    evidence: tests.ok ? "npm test" : tests.out.slice(0, 200),
  });

  const tenant = run("npm run validate:tenant-scope-pilot");
  rows.push({
    id: "CODE-03",
    area: "Tenant scope pilot",
    status: tenant.ok ? "GO" : "BLOCKED",
    evidence: tenant.ok ? "0 violations" : tenant.out.slice(0, 200),
  });

  const backfill = run("npm run workspace:backfill:status");
  rows.push({
    id: "DB-01",
    area: "Workspace backfill",
    status: backfill.ok ? "GO" : "BLOCKED",
    evidence: backfill.ok ? "all tables OK" : "DATABASE_URL required or backfill incomplete",
  });

  const stagingEnv = run("npm run verify:staging-env");
  const stagingLocal = run("npm run verify:staging-env:local");
  rows.push({
    id: "OPS-01",
    area: "Staging env (full)",
    status: stagingEnv.ok ? "GO" : stagingLocal.ok ? "WARN" : "BLOCKED",
    evidence: stagingEnv.ok
      ? "verify:staging-env"
      : stagingLocal.ok
        ? "local-pilot only — add Upstash + TOTP for Vercel"
        : "run staging:secrets:generate + Upstash + TOTP",
  });

  rows.push({
    id: "OPS-02",
    area: "Upstash REST",
    status: envSet("UPSTASH_REDIS_REST_URL") && envSet("UPSTASH_REDIS_REST_TOKEN") ? "GO" : "BLOCKED",
    evidence: envSet("UPSTASH_REDIS_REST_TOKEN") ? "credentials set" : "console.upstash.com",
  });

  rows.push({
    id: "OPS-03",
    area: "Impersonation TOTP",
    status: envSet("PLATFORM_IMPERSONATION_TOTP_SECRET") ? "GO" : "BLOCKED",
    evidence: envSet("PLATFORM_IMPERSONATION_TOTP_SECRET")
      ? "PLATFORM_IMPERSONATION_TOTP_SECRET"
      : "npm run setup:impersonation-totp",
  });

  const url =
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "";
  const realUrl =
    url &&
    !url.includes("yourdomain.com") &&
    !url.includes("example.com") &&
    url !== "http://localhost:3000";

  rows.push({
    id: "OPS-04",
    area: "Deployed staging URL",
    status: realUrl ? "GO" : "BLOCKED",
    evidence: realUrl ? url : "set NEXT_PUBLIC_APP_URL or SMOKE_BASE_URL",
  });

  if (realUrl) {
    const http = run(`SMOKE_BASE_URL=${url} npm run smoke:golden-path-http`);
    rows.push({
      id: "OPS-05",
      area: "HTTP golden path smoke",
      status: http.ok ? "GO" : "BLOCKED",
      evidence: http.ok ? "smoke:golden-path-http" : http.out.slice(0, 200),
    });
  } else {
    rows.push({
      id: "OPS-05",
      area: "HTTP golden path smoke",
      status: "BLOCKED",
      evidence: "needs deployed URL",
    });
  }

  const e2eReady =
    envSet("E2E_PILOT_EMAIL") &&
    envSet("E2E_PILOT_PASSWORD") &&
    (envSet("PLAYWRIGHT_BASE_URL") || realUrl);
  rows.push({
    id: "OPS-06",
    area: "E2E pilot bundle",
    status: e2eReady ? "WARN" : "BLOCKED",
    evidence: e2eReady
      ? "run: npm run test:e2e:pilot (or GitHub E2E Pilot Journey)"
      : "set E2E_PILOT_* + PLAYWRIGHT_BASE_URL",
  });

  const signoffPath = join(process.cwd(), "docs/artifacts/PILOT_SIGNOFF.json");
  const signoff = existsSync(signoffPath);
  rows.push({
    id: "PROD-01",
    area: "Manual golden path + sign-off",
    status: signoff ? "GO" : "BLOCKED",
    evidence: signoff
      ? "docs/artifacts/PILOT_SIGNOFF.json"
      : "docs/PILOT_GOLDEN_PATH_CHECKLIST.md + npm run pilot:record-signoff",
  });

  const blocked = rows.filter((r) => r.status === "BLOCKED").length;
  const warn = rows.filter((r) => r.status === "WARN").length;
  const go = rows.filter((r) => r.status === "GO").length;
  const verdict = blocked > 0 ? "NO-GO" : warn > 0 ? "GO WITH WARNINGS" : "GO";

  const lines = [
    "# Paid pilot — GO / NO-GO status",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    `**Verdict:** ${verdict} (${go} GO · ${warn} WARN · ${blocked} BLOCKED)`,
    "",
    "| ID | Area | Status | Evidence |",
    "|----|------|--------|----------|",
    ...rows.map(
      (r) => `| ${r.id} | ${r.area} | ${r.status} | ${r.evidence.replace(/\|/g, "\\|")} |`,
    ),
    "",
    "## Blocker owners",
    "",
    "| Blocker | Owner | Command |",
    "|---------|-------|---------|",
    "| Upstash + TOTP on Vercel | Ops | `npm run vercel:staging-push -- --apply` |",
    "| Deploy staging + build | Ops/CI | `npm run build` · workflow **Paid Pilot Gate** |",
    "| HTTP / E2E on real URL | Ops | `npm run smoke:golden-path-http` · `npm run test:e2e:pilot` |",
    "| Manual golden path | Product | `docs/PILOT_GOLDEN_PATH_CHECKLIST.md` |",
    "| Sign-off | Tech + Ops + Product | `npm run pilot:record-signoff` |",
    "",
  ];

  const outDir = join(process.cwd(), "docs/generated");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "PILOT_GO_NO_GO_STATUS.md");
  writeFileSync(outPath, lines.join("\n"), "utf8");

  console.log(lines.join("\n"));
  console.log(`\nWrote ${outPath}`);
  process.exit(blocked > 0 ? 1 : 0);
}

main();
