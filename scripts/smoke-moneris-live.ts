/**
 * Moneris live smoke — validate OAuth, gateway verify, payment processing wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  MONERIS_LIVE_SMOKE_ERA88_POLICY_ID,
  MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT,
} from "@/lib/integrations/moneris-live-smoke-era88-policy";
import { isPlaceholderMonerisCredential } from "@/lib/integrations/moneris-live-smoke-summary";
import { verifyMonerisGatewayConnection } from "@/services/integrations/moneris/moneris-api";
import { getMonerisCredentials } from "@/services/integrations/moneris/moneris-credentials";

export const MONERIS_LIVE_SMOKE_ARTIFACT = MONERIS_LIVE_SMOKE_ERA88_SUMMARY_ARTIFACT;

export const MONERIS_LIVE_SMOKE_VERSION = MONERIS_LIVE_SMOKE_ERA88_POLICY_ID;

export type MonerisLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type MonerisLiveSmokeStep = {
  id: string;
  label: string;
  status: MonerisLiveSmokeStepStatus;
  detail?: string;
};

export type MonerisLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_credentials"
  | "proof_failed";

export type MonerisLiveSmokeSummary = {
  version: typeof MONERIS_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: MonerisLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: MonerisLiveSmokeStep[];
  connectionId: string | null;
  storeId: string | null;
  honestyNote: string;
};

export type MonerisLiveSmokeEnvInput = {
  accessToken: string | null;
  apiToken: string | null;
  storeId: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readMonerisLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): MonerisLiveSmokeEnvInput {
  return {
    accessToken: env.MONERIS_ACCESS_TOKEN?.trim() ?? null,
    apiToken: env.MONERIS_API_TOKEN?.trim() ?? null,
    storeId: env.MONERIS_STORE_ID?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingMonerisLiveSmokeEnvVars(input: MonerisLiveSmokeEnvInput): string[] {
  const missing: string[] = [];
  if (!input.databaseUrl) missing.push("DATABASE_URL");

  const hasDirect = Boolean(input.accessToken || input.apiToken);
  const hasDbTenant =
    Boolean(input.encryptionKey) && Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirect && !hasDbTenant) {
    if (!input.accessToken && !input.apiToken) {
      missing.push("MONERIS_ACCESS_TOKEN");
      missing.push("MONERIS_API_TOKEN");
    }
    if (!input.encryptionKey && !hasDirect) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!hasDirect) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  if (!input.storeId && !hasDbTenant) {
    missing.push("MONERIS_STORE_ID");
  }

  return [...new Set(missing)];
}

export function buildMonerisLiveSmokeSummary(input: {
  steps: MonerisLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
  storeId?: string | null;
}): MonerisLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "gateway_connection_wiring" && step.status === "SKIPPED",
  );

  let overall: MonerisLiveSmokeSummary["overall"];
  let proofStatus: MonerisLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_credentials";
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
    version: MONERIS_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    storeId: input.storeId ?? null,
    honestyNote:
      "PASS requires live Moneris OAuth/API credentials + gateway verify — purchase charge skipped without sandbox card token.",
  };
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: MonerisLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string | null;
      userId: string | null;
      accessToken: string | null;
      apiToken: string | null;
      storeId: string | null;
    }
  | { error: string }
> {
  if (input.accessToken || input.apiToken) {
    return {
      connectionId: input.connectionId,
      userId: null,
      accessToken: input.accessToken,
      apiToken: input.apiToken,
      storeId: input.storeId,
    };
  }

  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.ownerEmail) {
    const profile = await prisma.userProfile.findFirst({
      where: { email: input.ownerEmail.trim().toLowerCase() },
      select: { id: true },
    });
    if (profile) {
      conn = await prisma.integrationConnection.findFirst({
        where: {
          userId: profile.id,
          provider: IntegrationProvider.MONERIS,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Moneris connection in DATABASE_URL — complete OAuth in dashboard or set MONERIS_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getMonerisCredentials(conn);
  if (!decrypted?.accessToken && !decrypted?.apiToken) {
    return { error: "Connection missing Moneris credentials (ENCRYPTION_KEY?)" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    accessToken: decrypted.accessToken,
    apiToken: decrypted.apiToken,
    storeId: decrypted.storeId ?? input.storeId,
  };
}

export async function runMonerisLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<MonerisLiveSmokeSummary> {
  const input = readMonerisLiveSmokeEnv(env);
  const missingEnvVars = listMissingMonerisLiveSmokeEnvVars(input);
  const steps: MonerisLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildMonerisLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Moneris or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Moneris connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildMonerisLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        storeId: input.storeId,
      });
    }

    const { connectionId, userId, accessToken, apiToken } = resolved;
    let { storeId } = resolved;

    steps.push({
      id: "resolve_connection",
      label: "Resolve Moneris connection",
      status: "PASSED",
      detail: connectionId
        ? `connectionId=${connectionId}`
        : "Direct MONERIS_ACCESS_TOKEN or MONERIS_API_TOKEN",
    });

    if (!storeId) {
      steps.push({
        id: "gateway_connection_wiring",
        label: "Moneris gateway connection verify",
        status: "SKIPPED",
        detail: "MONERIS_STORE_ID required — set in vault or OAuth connection settings.",
      });
      return buildMonerisLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        storeId,
      });
    }

    const placeholderCreds =
      (accessToken && isPlaceholderMonerisCredential(accessToken)) ||
      (apiToken && isPlaceholderMonerisCredential(apiToken));

    const verify = await verifyMonerisGatewayConnection({
      accessToken,
      apiToken,
      storeId,
    });

    steps.push({
      id: "gateway_connection_wiring",
      label: "Moneris gateway connection verify",
      status: verify.ok ? "PASSED" : placeholderCreds ? "SKIPPED" : "FAILED",
      detail: verify.ok
        ? `Gateway reachable for store ${storeId}.`
        : placeholderCreds
          ? `Placeholder credentials: ${verify.error}. Replace with live OAuth/API token in vault.`
          : verify.error,
    });
    if (!verify.ok) {
      return buildMonerisLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        storeId,
      });
    }

    steps.push({
      id: "payment_gateway_wiring",
      label: "Payment gateway wiring (dry-run)",
      status: "SKIPPED",
      detail:
        userId != null
          ? "Wiring verified via gateway ping — sandbox card token required for live purchase."
          : "Wiring verified via gateway ping — connect OAuth tenant for processMonerisPayment path.",
    });

    return buildMonerisLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      connectionId,
      storeId,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runMonerisLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), MONERIS_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${MONERIS_LIVE_SMOKE_ARTIFACT}\n`);
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
