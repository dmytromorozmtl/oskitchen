/**
 * Xero live smoke — validate OAuth credentials, invoice sync, bank reconciliation wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  XERO_LIVE_SMOKE_ERA81_POLICY_ID,
  XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT,
} from "@/lib/integrations/xero-live-smoke-era81-policy";
import { isPlaceholderXeroTenantId } from "@/lib/integrations/xero-live-smoke-summary";
import { reconcileXeroBankTransactions } from "@/services/integrations/xero/bank-reconciliation.service";
import { syncXeroSupplierInvoices } from "@/services/integrations/xero/invoice-sync.service";
import { getXeroCredentials } from "@/services/integrations/xero/xero-credentials";
import { fetchXeroTenants } from "@/services/integrations/xero/xero-api";

export const XERO_LIVE_SMOKE_ARTIFACT = XERO_LIVE_SMOKE_ERA81_SUMMARY_ARTIFACT;

export const XERO_LIVE_SMOKE_VERSION = XERO_LIVE_SMOKE_ERA81_POLICY_ID;

export type XeroLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type XeroLiveSmokeStep = {
  id: string;
  label: string;
  status: XeroLiveSmokeStepStatus;
  detail?: string;
};

export type XeroLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_tenant"
  | "proof_failed";

export type XeroLiveSmokeSummary = {
  version: typeof XERO_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: XeroLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: XeroLiveSmokeStep[];
  connectionId: string | null;
  tenantId: string | null;
  honestyNote: string;
};

export type XeroLiveSmokeEnvInput = {
  clientId: string | null;
  accessToken: string | null;
  tenantId: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readXeroLiveSmokeEnv(env: NodeJS.ProcessEnv = process.env): XeroLiveSmokeEnvInput {
  return {
    clientId: env.XERO_CLIENT_ID?.trim() ?? null,
    accessToken: env.XERO_ACCESS_TOKEN?.trim() ?? null,
    tenantId: env.XERO_TENANT_ID?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingXeroLiveSmokeEnvVars(input: XeroLiveSmokeEnvInput): string[] {
  const missing: string[] = [];
  if (!input.databaseUrl) missing.push("DATABASE_URL");

  const hasDirect =
    Boolean(input.accessToken) && Boolean(input.tenantId) && Boolean(input.clientId);

  const hasDbTenant =
    Boolean(input.encryptionKey) && Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirect && !hasDbTenant) {
    if (!input.clientId) missing.push("XERO_CLIENT_ID");
    if (!input.accessToken) missing.push("XERO_ACCESS_TOKEN");
    if (!input.tenantId) missing.push("XERO_TENANT_ID");
    if (!input.encryptionKey && !input.accessToken) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.accessToken) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

async function pingXeroApi(creds: {
  accessToken: string;
  tenantId: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const tenants = await fetchXeroTenants(creds.accessToken);
    const match = tenants.some((t) => t.tenantId === creds.tenantId);
    if (!match && tenants.length > 0) {
      return {
        ok: false,
        message: `Tenant ${creds.tenantId} not in OAuth connections (${tenants.length} tenants found).`,
      };
    }
    return {
      ok: tenants.length > 0,
      message:
        tenants.length > 0
          ? `Xero API reachable (${tenants.length} tenant connection(s)).`
          : "Xero API returned no tenant connections.",
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Xero connection test failed.",
    };
  }
}

export function buildXeroLiveSmokeSummary(input: {
  steps: XeroLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
  tenantId?: string | null;
}): XeroLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "xero_oauth_connection" && step.status === "SKIPPED",
  );

  let overall: XeroLiveSmokeSummary["overall"];
  let proofStatus: XeroLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_tenant";
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
    version: XERO_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    tenantId: input.tenantId ?? null,
    honestyNote:
      "PASS requires live Xero OAuth + invoice sync + bank reconciliation wiring — sync may skip when no supplier invoices or sales data absent.",
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: XeroLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      userId: string;
      creds: { accessToken: string; tenantId: string };
      tenantId: string;
    }
  | { error: string }
> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.tenantId) {
    conn = await prisma.integrationConnection.findFirst({
      where: {
        provider: IntegrationProvider.XERO,
        externalStoreId: input.tenantId,
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
          provider: IntegrationProvider.XERO,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Xero connection in DATABASE_URL — complete OAuth in dashboard or set XERO_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getXeroCredentials(conn);
  const creds =
    input.accessToken && input.tenantId
      ? { accessToken: input.accessToken, tenantId: input.tenantId }
      : decrypted
        ? { accessToken: decrypted.accessToken, tenantId: decrypted.tenantId }
        : null;

  if (!creds?.accessToken || !creds.tenantId) {
    return { error: "Connection missing Xero access token or tenant ID (ENCRYPTION_KEY?)" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    creds,
    tenantId: creds.tenantId,
  };
}

export async function runXeroLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<XeroLiveSmokeSummary> {
  const input = readXeroLiveSmokeEnv(env);
  const missingEnvVars = listMissingXeroLiveSmokeEnvVars(input);
  const steps: XeroLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildXeroLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Xero or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Xero connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildXeroLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        tenantId: input.tenantId,
      });
    }

    const { connectionId, userId, creds, tenantId } = resolved;
    steps.push({
      id: "resolve_connection",
      label: "Resolve Xero connection",
      status: "PASSED",
      detail: `connectionId=${connectionId}`,
    });

    const placeholderTenant = isPlaceholderXeroTenantId(tenantId);
    const ping = await pingXeroApi(creds);
    steps.push({
      id: "xero_oauth_connection",
      label: "Xero OAuth API connection",
      status: ping.ok ? "PASSED" : placeholderTenant ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderTenant
          ? `Tenant ${tenantId}: ${ping.message}. Update Dashboard → Integrations → Xero (saved tenant is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      return buildXeroLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        tenantId,
      });
    }

    const invoice = await syncXeroSupplierInvoices(userId);
    steps.push({
      id: "invoice_sync_wiring",
      label: "Supplier invoice sync wiring",
      status: invoice.ok ? "PASSED" : "FAILED",
      detail: invoice.message,
    });

    const reconcile = await reconcileXeroBankTransactions(userId);
    steps.push({
      id: "bank_reconciliation_wiring",
      label: "Bank reconciliation wiring",
      status: reconcile.ok ? "PASSED" : "FAILED",
      detail: reconcile.message,
    });

    return buildXeroLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      connectionId,
      tenantId,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runXeroLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), XERO_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${XERO_LIVE_SMOKE_ARTIFACT}\n`);
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
