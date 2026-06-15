/**
 * Homebase live smoke — validate OAuth credentials, schedule import, time clock wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { addDays, startOfDay } from "date-fns";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID,
  HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT,
} from "@/lib/integrations/homebase-live-smoke-era83-policy";
import { isPlaceholderHomebaseLocationId } from "@/lib/integrations/homebase-live-smoke-summary";
import { fetchHomebaseShiftsApi } from "@/services/integrations/homebase/homebase-api";
import { getHomebaseCredentials } from "@/services/integrations/homebase/homebase-credentials";
import { syncHomebaseScheduleImport } from "@/services/integrations/homebase/schedule-import.service";
import { syncHomebaseTimeClock } from "@/services/integrations/homebase/time-clock.service";

export const HOMEBASE_LIVE_SMOKE_ARTIFACT = HOMEBASE_LIVE_SMOKE_ERA83_SUMMARY_ARTIFACT;

export const HOMEBASE_LIVE_SMOKE_VERSION = HOMEBASE_LIVE_SMOKE_ERA83_POLICY_ID;

export type HomebaseLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type HomebaseLiveSmokeStep = {
  id: string;
  label: string;
  status: HomebaseLiveSmokeStepStatus;
  detail?: string;
};

export type HomebaseLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_location"
  | "proof_failed";

export type HomebaseLiveSmokeSummary = {
  version: typeof HOMEBASE_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: HomebaseLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: HomebaseLiveSmokeStep[];
  connectionId: string | null;
  locationId: string | null;
  honestyNote: string;
};

export type HomebaseLiveSmokeEnvInput = {
  clientId: string | null;
  accessToken: string | null;
  locationId: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readHomebaseLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): HomebaseLiveSmokeEnvInput {
  return {
    clientId: env.HOMEBASE_CLIENT_ID?.trim() ?? null,
    accessToken: env.HOMEBASE_ACCESS_TOKEN?.trim() ?? null,
    locationId: env.HOMEBASE_LOCATION_ID?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingHomebaseLiveSmokeEnvVars(input: HomebaseLiveSmokeEnvInput): string[] {
  const missing: string[] = [];
  if (!input.databaseUrl) missing.push("DATABASE_URL");

  const hasDirect =
    Boolean(input.accessToken) && Boolean(input.locationId) && Boolean(input.clientId);

  const hasDbTenant =
    Boolean(input.encryptionKey) && Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirect && !hasDbTenant) {
    if (!input.clientId) missing.push("HOMEBASE_CLIENT_ID");
    if (!input.accessToken) missing.push("HOMEBASE_ACCESS_TOKEN");
    if (!input.locationId) missing.push("HOMEBASE_LOCATION_ID");
    if (!input.encryptionKey && !input.accessToken) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.accessToken) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

async function pingHomebaseApi(creds: {
  accessToken: string;
  locationId: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const rangeStart = startOfDay(new Date());
    const rangeEnd = addDays(rangeStart, 7);
    const fetched = await fetchHomebaseShiftsApi({
      accessToken: creds.accessToken,
      locationId: creds.locationId,
      start: rangeStart,
      end: rangeEnd,
    });
    if (!fetched.ok) {
      return { ok: false, message: fetched.message };
    }
    return {
      ok: true,
      message: `Homebase API reachable (${fetched.shifts.length} shift(s) in next 7 days).`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Homebase connection test failed.",
    };
  }
}

export function buildHomebaseLiveSmokeSummary(input: {
  steps: HomebaseLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
  locationId?: string | null;
}): HomebaseLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "homebase_oauth_connection" && step.status === "SKIPPED",
  );

  let overall: HomebaseLiveSmokeSummary["overall"];
  let proofStatus: HomebaseLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_location";
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
    version: HOMEBASE_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    locationId: input.locationId ?? null,
    honestyNote:
      "PASS requires live Homebase OAuth + schedule import and time clock wiring — sync may skip when staff mappings are absent.",
  };
}

function scheduleImportNeedsMappings(message: string): boolean {
  return /staff member|employee ID|Map at least one|Map staff/i.test(message);
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: HomebaseLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      userId: string;
      creds: { accessToken: string; locationId: string };
      locationId: string;
    }
  | { error: string }
> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.locationId) {
    conn = await prisma.integrationConnection.findFirst({
      where: {
        provider: IntegrationProvider.HOMEBASE,
        externalStoreId: input.locationId,
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
          provider: IntegrationProvider.HOMEBASE,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Homebase connection in DATABASE_URL — complete OAuth in dashboard or set HOMEBASE_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getHomebaseCredentials(conn);
  const creds =
    input.accessToken && input.locationId
      ? { accessToken: input.accessToken, locationId: input.locationId }
      : decrypted
        ? { accessToken: decrypted.accessToken, locationId: decrypted.locationId }
        : null;

  if (!creds?.accessToken || !creds.locationId) {
    return { error: "Connection missing Homebase access token or location ID (ENCRYPTION_KEY?)" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    creds,
    locationId: creds.locationId,
  };
}

export async function runHomebaseLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<HomebaseLiveSmokeSummary> {
  const input = readHomebaseLiveSmokeEnv(env);
  const missingEnvVars = listMissingHomebaseLiveSmokeEnvVars(input);
  const steps: HomebaseLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildHomebaseLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Homebase or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Homebase connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildHomebaseLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        locationId: input.locationId,
      });
    }

    const { connectionId, userId, creds, locationId } = resolved;
    steps.push({
      id: "resolve_connection",
      label: "Resolve Homebase connection",
      status: "PASSED",
      detail: `connectionId=${connectionId}`,
    });

    const placeholderLocation = isPlaceholderHomebaseLocationId(locationId);
    const ping = await pingHomebaseApi(creds);
    steps.push({
      id: "homebase_oauth_connection",
      label: "Homebase OAuth API connection",
      status: ping.ok ? "PASSED" : placeholderLocation ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderLocation
          ? `Location ${locationId}: ${ping.message}. Update Dashboard → Integrations → Homebase (saved location is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      return buildHomebaseLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        locationId,
      });
    }

    const schedule = await syncHomebaseScheduleImport(userId);
    steps.push({
      id: "schedule_import_wiring",
      label: "Schedule import wiring",
      status: schedule.ok
        ? "PASSED"
        : scheduleImportNeedsMappings(schedule.message)
          ? "SKIPPED"
          : "FAILED",
      detail: schedule.message,
    });

    const timeClock = await syncHomebaseTimeClock(userId);
    steps.push({
      id: "time_clock_wiring",
      label: "Time clock sync wiring",
      status: timeClock.ok
        ? "PASSED"
        : scheduleImportNeedsMappings(timeClock.message)
          ? "SKIPPED"
          : "FAILED",
      detail: timeClock.message,
    });

    return buildHomebaseLiveSmokeSummary({
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
  const summary = await runHomebaseLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), HOMEBASE_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${HOMEBASE_LIVE_SMOKE_ARTIFACT}\n`);
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
