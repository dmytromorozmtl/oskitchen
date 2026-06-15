/**
 * Paid-pilot action queue — shared by pilot:next-step and instruction generator.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaClient } from "@prisma/client";

import { scanUpstashCredentials } from "./scan-upstash-credentials";
import { loadEnvFiles, loadStagingPilotEnv, parseDotenv } from "./load-dotenv-file";
import {
  isPlaceholderEnvValue,
  isValidUpstashToken,
  isValidUpstashUrl,
} from "./staging-env-placeholders";

export const ROOT = process.cwd();
export const SNIPPET = join(ROOT, "docs/generated/PILOT_E2E_ENV_SNIPPET.env");

export type PilotAction = {
  id: string;
  title: string;
  owner: string;
  done: () => boolean | Promise<boolean>;
  auto?: () => boolean | Promise<boolean>;
  manual?: string[];
};

export type PilotQueueItem = {
  action: PilotAction;
  complete: boolean;
};

export type UrlProbeRow = {
  url: string;
  path: string;
  status: number;
  ok: boolean;
};

const PROBE_PATHS = ["/api/health", "/login", "/"] as const;

export function pilotEnv(key: string): string | undefined {
  return process.env[key]?.trim() || undefined;
}

function isPlaceholderUrl(u: string): boolean {
  return (
    u.includes("yourdomain.com") ||
    u.includes("example.com") ||
    u === "http://localhost:3000"
  );
}

export function pilotStagingUrl(): string | undefined {
  const u =
    pilotEnv("SMOKE_BASE_URL") ??
    pilotEnv("NEXT_PUBLIC_APP_URL") ??
    pilotEnv("STAGING_APP_URL");
  return u && !isPlaceholderUrl(u) ? u : undefined;
}

export function sh(cmd: string): boolean {
  try {
    execSync(cmd, {
      cwd: ROOT,
      stdio: "inherit",
      env: { ...process.env, NPM_CONFIG_PRODUCTION: "false" },
    });
    return true;
  } catch {
    return false;
  }
}

async function workspaceHasStaff(ownerEmail: string): Promise<boolean> {
  if (!pilotEnv("DATABASE_URL") || pilotEnv("DATABASE_URL")!.includes("aws-REGION")) {
    return false;
  }
  const prisma = new PrismaClient();
  try {
    const owner = await prisma.userProfile.findFirst({
      where: { email: { equals: ownerEmail, mode: "insensitive" } },
      select: { id: true },
    });
    if (!owner) return false;
    const ws = await prisma.workspace.findFirst({
      where: { ownerUserId: owner.id },
      select: { members: { select: { userId: true } } },
    });
    return Boolean(ws?.members.some((m) => m.userId !== owner.id));
  } catch {
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

export async function probeUrl(base: string, path: string): Promise<UrlProbeRow> {
  const url = `${base.replace(/\/$/, "")}${path}`;
  try {
    const res = await fetch(url, { redirect: "manual" });
    const ok =
      path === "/api/health"
        ? res.status === 200
        : res.status === 200 || res.status === 307 || res.status === 308;
    return { url: base.replace(/\/$/, ""), path, status: res.status, ok };
  } catch {
    return { url: base.replace(/\/$/, ""), path, status: 0, ok: false };
  }
}

export async function probeAllStagingUrls(candidates: string[]): Promise<UrlProbeRow[]> {
  const rows: UrlProbeRow[] = [];
  const seen = new Set<string>();
  for (const base of candidates) {
    const norm = base.replace(/\/$/, "");
    if (seen.has(norm)) continue;
    seen.add(norm);
    for (const path of PROBE_PATHS) {
      rows.push(await probeUrl(norm, path));
    }
  }
  return rows;
}

export function collectVercelUrlCandidates(): string[] {
  const sources = [
    ".env.staging.local",
    ".env.storefront.week1.example",
    ".env.storefront.staging.local",
    ".env.local",
    ".env.beta.local",
  ];
  const urls = new Set<string>();
  for (const rel of sources) {
    const p = join(ROOT, rel);
    if (!existsSync(p)) continue;
    const env = parseDotenv(readFileSync(p, "utf8"));
    for (const v of Object.values(env)) {
      if (v.includes(".vercel.app") && !isPlaceholderEnvValue(v)) {
        urls.add(v.replace(/\/$/, ""));
      }
    }
  }
  return [...urls];
}

export function bestLiveStagingUrl(rows: UrlProbeRow[]): string | undefined {
  const byUrl = new Map<string, UrlProbeRow[]>();
  for (const r of rows) {
    const list = byUrl.get(r.url) ?? [];
    list.push(r);
    byUrl.set(r.url, list);
  }
  for (const [url, probes] of byUrl) {
    const health = probes.find((p) => p.path === "/api/health" && p.ok);
    const login = probes.find((p) => p.path === "/login" && p.ok);
    if (health || login) return url;
  }
  return undefined;
}

export async function buildPilotQueue(): Promise<PilotAction[]> {
  loadStagingPilotEnv(ROOT);
  const owner =
    pilotEnv("STAGING_PILOT_OWNER_EMAIL") ??
    pilotEnv("E2E_PILOT_EMAIL") ??
    "workspace.moroz@gmail.com";
  const hasStaff = pilotEnv("DATABASE_URL") ? await workspaceHasStaff(owner) : false;
  const url = pilotStagingUrl();

  return [
    {
      id: "deps",
      title: "npm ci (devDependencies)",
      owner: "auto",
      done: () => existsSync(join(ROOT, "node_modules/vitest/package.json")),
      auto: () => sh("npm ci"),
    },
    {
      id: "secrets",
      title: "Staging secrets (CRON, ENCRYPTION)",
      owner: "auto",
      done: () => Boolean(pilotEnv("CRON_SECRET") && pilotEnv("ENCRYPTION_KEY")),
      auto: () => {
        sh("bash scripts/generate-staging-pilot-secrets.sh");
        loadEnvFiles([".env", ".env.local", ".env.staging.local"], ROOT, {
          skipEmptyInFile: true,
        });
        return Boolean(pilotEnv("CRON_SECRET") && pilotEnv("ENCRYPTION_KEY"));
      },
    },
    {
      id: "sync-env",
      title: "DATABASE_URL from .env.local",
      owner: "auto",
      done: () =>
        Boolean(pilotEnv("DATABASE_URL") && !pilotEnv("DATABASE_URL")!.includes("aws-REGION")),
      auto: () => {
        if (!existsSync(join(ROOT, ".env.local"))) return false;
        sh("npx tsx scripts/sync-staging-env-from-local.ts");
        loadEnvFiles([".env", ".env.local", ".env.staging.local"], ROOT, {
          skipEmptyInFile: true,
        });
        return Boolean(
          pilotEnv("DATABASE_URL") && !pilotEnv("DATABASE_URL")!.includes("aws-REGION"),
        );
      },
    },
    {
      id: "totp",
      title: "Platform impersonation TOTP (auto-generate)",
      owner: "auto",
      done: () => Boolean(pilotEnv("PLATFORM_IMPERSONATION_TOTP_SECRET")),
      auto: () => {
        sh("npx tsx scripts/generate-staging-totp.ts");
        loadEnvFiles([".env", ".env.local", ".env.staging.local"], ROOT, {
          skipEmptyInFile: true,
        });
        return Boolean(pilotEnv("PLATFORM_IMPERSONATION_TOTP_SECRET"));
      },
      manual: [
        "Scan QR from script output; add same secret to Vercel staging",
        "npm run vercel:staging-push -- --apply",
      ],
    },
    {
      id: "upstash",
      title: "Upstash REST credentials",
      owner: "ops",
      done: () =>
        isValidUpstashUrl(pilotEnv("UPSTASH_REDIS_REST_URL") ?? "") &&
        isValidUpstashToken(pilotEnv("UPSTASH_REDIS_REST_TOKEN") ?? ""),
      auto: () => {
        sh("npx tsx scripts/clean-staging-env-placeholders.ts");
        sh("npx tsx scripts/bootstrap-staging-from-known-env.ts");
        const hit = scanUpstashCredentials(ROOT);
        if (hit) {
          sh(
            `npm run staging:upstash:set -- --url="${hit.url.replace(/"/g, "")}" --token="${hit.token.replace(/"/g, "")}"`,
          );
        }
        loadEnvFiles([".env", ".env.local", ".env.staging.local"], ROOT, {
          skipEmptyInFile: true,
        });
        return (
          isValidUpstashUrl(pilotEnv("UPSTASH_REDIS_REST_URL") ?? "") &&
          isValidUpstashToken(pilotEnv("UPSTASH_REDIS_REST_TOKEN") ?? "")
        );
      },
      manual: [
        "npm run pilot:upstash:gate",
        "npm run pilot:upstash:gate -- --wizard",
        "Edit .env.upstash.paste.local → npm run pilot:upstash:gate",
        "Local-only (not Vercel GO): npm run pilot:local-continue",
      ],
    },
    {
      id: "staging-url",
      title: "Deployed staging URL (Vercel)",
      owner: "auto",
      done: () => Boolean(url && !isPlaceholderEnvValue(url)),
      auto: () => {
        sh("npx tsx scripts/bootstrap-staging-from-known-env.ts");
        loadEnvFiles([".env", ".env.local", ".env.staging.local"], ROOT, {
          skipEmptyInFile: true,
        });
        const u = pilotStagingUrl();
        return Boolean(u && !isPlaceholderEnvValue(u));
      },
      manual: [
        "export STAGING_APP_URL=https://your-preview.vercel.app",
        "npm run staging:bootstrap-known-env",
        "npm run staging:url:probe -- --fix",
        "npm run vercel:staging-push -- --apply && redeploy",
      ],
    },
    {
      id: "deploy-live",
      title: "Staging deploy responds (HTTP 200)",
      owner: "ops",
      done: async () => {
        const u = pilotStagingUrl();
        if (!u) return false;
        const rows = await probeAllStagingUrls([u]);
        return Boolean(bestLiveStagingUrl(rows));
      },
      manual: [
        "Vercel → staging branch → Redeploy (or merge to deploy branch)",
        "npm run staging:url:probe -- --fix",
        "GitHub Actions → Paid Pilot Gate",
      ],
    },
    {
      id: "db",
      title: "DB migrate + backfill + staff scope",
      owner: "auto",
      done: () => {
        if (!pilotEnv("DATABASE_URL")) return false;
        try {
          execSync("npx tsx scripts/check-backfill-status.ts", {
            cwd: ROOT,
            stdio: "pipe",
            env: process.env,
          });
          return true;
        } catch {
          return false;
        }
      },
      auto: async () => sh("npm run staging:pilot:db"),
    },
    {
      id: "staff",
      title: "Staff invite for golden path / E2E",
      owner: "product",
      done: () => hasStaff,
      auto: () => {
        const staff =
          pilotEnv("PILOT_STAFF_EMAIL") ??
          pilotEnv("E2E_PILOT_STAFF_EMAIL") ??
          `pilot-staff-${Date.now()}@kitchenos.test`;
        sh(`npm run smoke:team-invites -- --owner-email=${owner} --email=${staff}`);
        writeFileSync(
          SNIPPET,
          [
            "# E2E env snippet (do not commit passwords)",
            `export E2E_PILOT_EMAIL=${owner}`,
            "export E2E_PILOT_PASSWORD=<owner-password>",
            `export E2E_PILOT_STAFF_EMAIL=${staff}`,
            "export E2E_PILOT_STAFF_PASSWORD=<after-signup>",
            "export PLAYWRIGHT_BASE_URL=<staging-url>",
            "",
          ].join("\n"),
          "utf8",
        );
        return false;
      },
      manual: [
        "Dashboard → Storefront → Team → invite staff",
        `npm run smoke:team-invites -- --owner-email=${owner} --accept-user-id=…`,
      ],
    },
    ...(url
      ? [
          {
            id: "http",
            title: "HTTP golden path smoke",
            owner: "auto",
            done: () => existsSync(join(ROOT, "docs/generated/PILOT_HTTP_SMOKE_OK")),
            auto: () => sh(`SMOKE_BASE_URL=${url} npm run smoke:golden-path-http`),
          } as PilotAction,
        ]
      : []),
    ...(url && pilotEnv("E2E_PILOT_EMAIL") && pilotEnv("E2E_PILOT_PASSWORD")
      ? [
          {
            id: "e2e",
            title: "Playwright pilot journey",
            owner: "auto",
            done: () => existsSync(join(ROOT, "docs/generated/PILOT_E2E_OK")),
            auto: () => {
              const ok = sh(`PLAYWRIGHT_BASE_URL=${url} npm run test:e2e:pilot`);
              if (ok) {
                writeFileSync(
                  join(ROOT, "docs/generated/PILOT_E2E_OK"),
                  JSON.stringify({ at: new Date().toISOString(), url }),
                  "utf8",
                );
              }
              return ok;
            },
          } as PilotAction,
        ]
      : url
        ? [
            {
              id: "e2e-env",
              title: "Configure E2E pilot credentials",
              owner: "ops",
              done: () => false,
              manual: [SNIPPET, "docs/E2E_PILOT_JOURNEY.md"],
            } as PilotAction,
          ]
        : []),
    {
      id: "golden-manual",
      title: "Manual golden path checklist",
      owner: "product",
      done: () => existsSync(join(ROOT, "docs/artifacts/PILOT_SIGNOFF.json")),
      manual: ["docs/PILOT_GOLDEN_PATH_CHECKLIST.md (~45–60 min)"],
    },
    {
      id: "signoff",
      title: "Record Tech + Ops + Product sign-off",
      owner: "all",
      done: () => {
        try {
          const j = JSON.parse(
            readFileSync(join(ROOT, "docs/artifacts/PILOT_SIGNOFF.json"), "utf8"),
          ) as { verdict?: string };
          return j.verdict === "GO";
        } catch {
          return false;
        }
      },
      manual: [
        'npm run pilot:record-signoff -- --role=tech --by="…" --go',
        'npm run pilot:record-signoff -- --role=ops --by="…" --go',
        'npm run pilot:record-signoff -- --role=product --by="…" --go',
      ],
    },
  ];
}

export async function resolvePilotQueue(): Promise<PilotQueueItem[]> {
  const queue = await buildPilotQueue();
  return Promise.all(
    queue.map(async (action) => ({
      action,
      complete: await action.done(),
    })),
  );
}

export async function nextIncompletePilotAction(): Promise<PilotAction | undefined> {
  const resolved = await resolvePilotQueue();
  return resolved.find((x) => !x.complete)?.action;
}
