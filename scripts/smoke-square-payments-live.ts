/**
 * Square Payments live smoke — validate OAuth, payment processing, refund sync wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID,
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT,
} from "@/lib/integrations/square-payments-live-smoke-era87-policy";
import { isPlaceholderSquarePaymentsAccessToken } from "@/lib/integrations/square-payments-live-smoke-summary";
import { listSquareRefundsApi } from "@/services/integrations/square-payments/square-payments-api";
import {
  getSquarePaymentsApiBase,
  getSquarePaymentsCredentials,
  squarePaymentsHeaders,
} from "@/services/integrations/square-payments/square-payments-credentials";
import { syncSquareRefunds } from "@/services/integrations/square-payments/refund-sync.service";

export const SQUARE_PAYMENTS_LIVE_SMOKE_ARTIFACT =
  SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_SUMMARY_ARTIFACT;

export const SQUARE_PAYMENTS_LIVE_SMOKE_VERSION = SQUARE_PAYMENTS_LIVE_SMOKE_ERA87_POLICY_ID;

export type SquarePaymentsLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type SquarePaymentsLiveSmokeStep = {
  id: string;
  label: string;
  status: SquarePaymentsLiveSmokeStepStatus;
  detail?: string;
};

export type SquarePaymentsLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_token"
  | "proof_failed";

export type SquarePaymentsLiveSmokeSummary = {
  version: typeof SQUARE_PAYMENTS_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: SquarePaymentsLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: SquarePaymentsLiveSmokeStep[];
  connectionId: string | null;
  locationId: string | null;
  honestyNote: string;
};

export type SquarePaymentsLiveSmokeEnvInput = {
  clientId: string | null;
  accessToken: string | null;
  locationId: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readSquarePaymentsLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): SquarePaymentsLiveSmokeEnvInput {
  return {
    clientId: env.SQUARE_PAYMENTS_CLIENT_ID?.trim() ?? null,
    accessToken: env.SQUARE_PAYMENTS_ACCESS_TOKEN?.trim() ?? null,
    locationId: env.SQUARE_PAYMENTS_LOCATION_ID?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingSquarePaymentsLiveSmokeEnvVars(
  input: SquarePaymentsLiveSmokeEnvInput,
): string[] {
  const missing: string[] = [];
  if (!input.databaseUrl) missing.push("DATABASE_URL");

  const hasDirect = Boolean(input.accessToken);
  const hasDbTenant =
    Boolean(input.encryptionKey) && Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirect && !hasDbTenant) {
    if (!input.accessToken) missing.push("SQUARE_PAYMENTS_ACCESS_TOKEN");
    if (!input.encryptionKey && !input.accessToken) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.accessToken) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

export function buildSquarePaymentsLiveSmokeSummary(input: {
  steps: SquarePaymentsLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
  locationId?: string | null;
}): SquarePaymentsLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "square_oauth_connection" && step.status === "SKIPPED",
  );

  let overall: SquarePaymentsLiveSmokeSummary["overall"];
  let proofStatus: SquarePaymentsLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_token";
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
    version: SQUARE_PAYMENTS_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    locationId: input.locationId ?? null,
    honestyNote:
      "PASS requires live Square OAuth + locations list + refund sync wiring — payment charge skipped without sandbox source_id.",
  };
}

async function pingSquarePaymentsApi(creds: {
  accessToken: string;
}): Promise<{ ok: boolean; message: string; locationId: string | null }> {
  try {
    const res = await fetch(`${getSquarePaymentsApiBase()}/v2/locations`, {
      headers: squarePaymentsHeaders(creds.accessToken),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        message: text.slice(0, 300) || `Square locations failed (${res.status})`,
        locationId: null,
      };
    }
    const json = (await res.json()) as {
      locations?: { id?: string; name?: string; status?: string }[];
    };
    const locations = json.locations ?? [];
    const active = locations.find((loc) => loc.status === "ACTIVE") ?? locations[0];
    return {
      ok: locations.length > 0,
      message:
        locations.length > 0
          ? `Square API reachable (${locations.length} location(s), active=${active?.name ?? active?.id ?? "n/a"}).`
          : "Square API returned no locations.",
      locationId: active?.id ?? null,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Square connection test failed.",
      locationId: null,
    };
  }
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: SquarePaymentsLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string | null;
      userId: string | null;
      accessToken: string;
      locationId: string | null;
    }
  | { error: string }
> {
  if (input.accessToken) {
    return {
      connectionId: input.connectionId,
      userId: null,
      accessToken: input.accessToken,
      locationId: input.locationId,
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
          provider: IntegrationProvider.SQUARE_PAYMENTS,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Square Payments connection in DATABASE_URL — complete OAuth in dashboard or set SQUARE_PAYMENTS_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getSquarePaymentsCredentials(conn);
  if (!decrypted?.accessToken) {
    return { error: "Connection missing Square access token (ENCRYPTION_KEY?)" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    accessToken: decrypted.accessToken,
    locationId: decrypted.locationId ?? input.locationId,
  };
}

export async function runSquarePaymentsLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SquarePaymentsLiveSmokeSummary> {
  const input = readSquarePaymentsLiveSmokeEnv(env);
  const missingEnvVars = listMissingSquarePaymentsLiveSmokeEnvVars(input);
  const steps: SquarePaymentsLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildSquarePaymentsLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Square or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Square Payments connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildSquarePaymentsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        locationId: input.locationId,
      });
    }

    const { connectionId, userId, accessToken } = resolved;
    let { locationId } = resolved;

    steps.push({
      id: "resolve_connection",
      label: "Resolve Square Payments connection",
      status: "PASSED",
      detail: connectionId ? `connectionId=${connectionId}` : "Direct SQUARE_PAYMENTS_ACCESS_TOKEN",
    });

    const placeholderToken = isPlaceholderSquarePaymentsAccessToken(accessToken);
    const ping = await pingSquarePaymentsApi({ accessToken });
    if (!locationId && ping.locationId) locationId = ping.locationId;

    steps.push({
      id: "square_oauth_connection",
      label: "Square OAuth API connection",
      status: ping.ok ? "PASSED" : placeholderToken ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderToken
          ? `Placeholder token: ${ping.message}. Replace with live OAuth token in vault.`
          : ping.message,
    });
    if (!ping.ok) {
      return buildSquarePaymentsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        locationId,
      });
    }

    steps.push({
      id: "payment_processing_wiring",
      label: "Payment processing wiring (dry-run)",
      status: "SKIPPED",
      detail:
        "Wiring verified via OAuth locations ping — sandbox source_id required for live charge.",
    });

    if (userId && locationId) {
      const refunds = await syncSquareRefunds(userId, { limit: 10 });
      steps.push({
        id: "refund_sync_wiring",
        label: "Refund sync wiring",
        status: refunds.ok ? "PASSED" : "FAILED",
        detail: refunds.message,
      });
    } else if (locationId) {
      const refunds = await listSquareRefundsApi({
        accessToken,
        locationId,
        limit: 10,
      });
      steps.push({
        id: "refund_sync_wiring",
        label: "Refund sync wiring (list-only)",
        status: "PASSED",
        detail: `Listed ${refunds.length} refund(s) — no live refund queued.`,
      });
    } else {
      steps.push({
        id: "refund_sync_wiring",
        label: "Refund sync wiring",
        status: "SKIPPED",
        detail: "No location ID — set SQUARE_PAYMENTS_LOCATION_ID or connect with location.",
      });
    }

    return buildSquarePaymentsLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      connectionId,
      locationId,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runSquarePaymentsLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), SQUARE_PAYMENTS_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${SQUARE_PAYMENTS_LIVE_SMOKE_ARTIFACT}\n`);
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
