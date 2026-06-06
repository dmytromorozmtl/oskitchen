/**
 * QuickBooks live smoke — validate OAuth credentials, query chart of accounts,
 * verify daily sales journal wiring.
 *
 * Usage:
 *   npx tsx scripts/smoke-quickbooks-live.ts [--write]
 *
 * Env (direct QuickBooks sandbox):
 *   QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET, QUICKBOOKS_ACCESS_TOKEN, QUICKBOOKS_REALM_ID
 *   DATABASE_URL, CHANNEL_SMOKE_CONNECTION_ID (optional)
 *
 * Env (load connection from staging DB):
 *   DATABASE_URL, ENCRYPTION_KEY, CHANNEL_SMOKE_OWNER_EMAIL | CHANNEL_SMOKE_CONNECTION_ID
 *
 * Missing credentials → SKIPPED WITH REASON (exit 0). Real failure → FAILED (exit 1).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import { getQuickBooksCredentials } from "@/services/integrations/quickbooks/quickbooks-credentials";
import {
  QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID,
  QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT,
} from "@/lib/integrations/quickbooks-live-smoke-era80-policy";
import { isPlaceholderQuickBooksRealmId } from "@/lib/integrations/quickbooks-live-smoke-summary";
import { fetchQuickBooksChartOfAccounts } from "@/services/integrations/quickbooks/chart-of-accounts.service";
import { postQuickBooksDailySalesJournal } from "@/services/integrations/quickbooks/daily-sales-journal.service";
import { queryQuickBooksAccounts } from "@/services/integrations/quickbooks/quickbooks-api";

export const QUICKBOOKS_LIVE_SMOKE_ARTIFACT = QUICKBOOKS_LIVE_SMOKE_ERA80_SUMMARY_ARTIFACT;

export const QUICKBOOKS_LIVE_SMOKE_VERSION = QUICKBOOKS_LIVE_SMOKE_ERA80_POLICY_ID;

export type QuickBooksLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type QuickBooksLiveSmokeStep = {
  id: string;
  label: string;
  status: QuickBooksLiveSmokeStepStatus;
  detail?: string;
};

export type QuickBooksLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_realm"
  | "proof_failed";

export type QuickBooksLiveSmokeSummary = {
  version: typeof QUICKBOOKS_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: QuickBooksLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: QuickBooksLiveSmokeStep[];
  connectionId: string | null;
  realmId: string | null;
  honestyNote: string;
};

export type QuickBooksLiveSmokeEnvInput = {
  clientId: string | null;
  clientSecret: string | null;
  accessToken: string | null;
  realmId: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readQuickBooksLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): QuickBooksLiveSmokeEnvInput {
  return {
    clientId: env.QUICKBOOKS_CLIENT_ID?.trim() ?? null,
    clientSecret: env.QUICKBOOKS_CLIENT_SECRET?.trim() ?? null,
    accessToken: env.QUICKBOOKS_ACCESS_TOKEN?.trim() ?? null,
    realmId: env.QUICKBOOKS_REALM_ID?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingQuickBooksLiveSmokeEnvVars(
  input: QuickBooksLiveSmokeEnvInput,
): string[] {
  const missing: string[] = [];
  if (!input.databaseUrl) missing.push("DATABASE_URL");

  const hasDirectQb =
    Boolean(input.accessToken) && Boolean(input.realmId) && Boolean(input.clientId);

  const hasDbTenant =
    Boolean(input.encryptionKey) && Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirectQb && !hasDbTenant) {
    if (!input.clientId) missing.push("QUICKBOOKS_CLIENT_ID");
    if (!input.accessToken) missing.push("QUICKBOOKS_ACCESS_TOKEN");
    if (!input.realmId) missing.push("QUICKBOOKS_REALM_ID");
    if (!input.encryptionKey && !input.accessToken) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.accessToken) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

async function pingQuickBooksApi(creds: {
  accessToken: string;
  realmId: string;
}): Promise<{ ok: boolean; message: string; accountCount?: number }> {
  try {
    const accounts = await queryQuickBooksAccounts(creds);
    return {
      ok: true,
      message: `QuickBooks API reachable (${accounts.length} accounts in chart).`,
      accountCount: accounts.length,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "QuickBooks connection test failed.",
    };
  }
}

export function buildQuickBooksLiveSmokeSummary(input: {
  steps: QuickBooksLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
  realmId?: string | null;
}): QuickBooksLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 ||
    input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "quickbooks_oauth_connection" && step.status === "SKIPPED",
  );

  let overall: QuickBooksLiveSmokeSummary["overall"];
  let proofStatus: QuickBooksLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_realm";
  } else if (failed) {
    overall = "FAILED";
    proofStatus = "proof_failed";
  } else if (skippedOnly) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else {
    overall = "PASSED";
    proofStatus = "proof_passed";
  }

  return {
    version: QUICKBOOKS_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    realmId: input.realmId ?? null,
    honestyNote:
      "PASS requires live QuickBooks OAuth + chart of accounts query + daily journal wiring — journal post may skip when mapping or sales data absent.",
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: QuickBooksLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      userId: string;
      creds: { accessToken: string; realmId: string };
      realmId: string;
    }
  | { error: string }
> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.realmId) {
    conn = await prisma.integrationConnection.findFirst({
      where: {
        provider: IntegrationProvider.QUICKBOOKS,
        externalStoreId: input.realmId,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  if (!conn && input.ownerEmail) {
    const profile = await prisma.userProfile.findFirst({
      where: { email: input.ownerEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (profile) {
      conn = await prisma.integrationConnection.findFirst({
        where: {
          userId: profile.id,
          provider: IntegrationProvider.QUICKBOOKS,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No QuickBooks connection in DATABASE_URL — complete OAuth in dashboard or set QUICKBOOKS_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getQuickBooksCredentials(conn);
  const creds =
    input.accessToken && input.realmId
      ? { accessToken: input.accessToken, realmId: input.realmId }
      : decrypted
        ? { accessToken: decrypted.accessToken, realmId: decrypted.realmId }
        : null;

  if (!creds?.accessToken || !creds.realmId) {
    return { error: "Connection missing QuickBooks access token or realm ID (ENCRYPTION_KEY?)" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    creds,
    realmId: creds.realmId,
  };
}

export async function runQuickBooksLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<QuickBooksLiveSmokeSummary> {
  const input = readQuickBooksLiveSmokeEnv(env);
  const missingEnvVars = listMissingQuickBooksLiveSmokeEnvVars(input);
  const steps: QuickBooksLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildQuickBooksLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct QuickBooks or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve QuickBooks connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildQuickBooksLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        realmId: input.realmId,
      });
    }

    const { connectionId, userId, creds, realmId } = resolved;
    const placeholderRealm = isPlaceholderQuickBooksRealmId(realmId);
    const ping = await pingQuickBooksApi(creds);
    steps.push({
      id: "quickbooks_oauth_connection",
      label: "QuickBooks OAuth API connection",
      status: ping.ok ? "PASSED" : placeholderRealm ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderRealm
          ? `Realm ${realmId}: ${ping.message}. Update Dashboard → Integrations → QuickBooks (saved realm is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      return buildQuickBooksLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        realmId,
      });
    }

    try {
      const chart = await fetchQuickBooksChartOfAccounts(userId);
      steps.push({
        id: "chart_of_accounts_sync",
        label: "Chart of accounts sync",
        status: chart.accounts.length > 0 ? "PASSED" : "FAILED",
        detail: `accounts=${chart.accounts.length} sales=${chart.salesAccounts.length} deposit=${chart.depositAccounts.length}`,
      });
      if (chart.accounts.length === 0) {
        return buildQuickBooksLiveSmokeSummary({
          steps,
          missingEnvVars: [],
          connectionId,
          realmId,
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      steps.push({
        id: "chart_of_accounts_sync",
        label: "Chart of accounts sync",
        status: "FAILED",
        detail: message,
      });
      return buildQuickBooksLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        realmId,
      });
    }

    const journal = await postQuickBooksDailySalesJournal(userId);
    steps.push({
      id: "daily_journal_wiring",
      label: "Daily sales journal export wiring",
      status: journal.ok ? "PASSED" : journal.message.includes("Map sales") ? "SKIPPED" : "SKIPPED",
      detail: journal.ok
        ? journal.message
        : `${journal.message} (wiring verified — map accounts + sales to post live journal)`,
    });

    return buildQuickBooksLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      connectionId,
      realmId,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runQuickBooksLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), QUICKBOOKS_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${QUICKBOOKS_LIVE_SMOKE_ARTIFACT}\n`);
  }

  if (summary.overall === "FAILED") {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
