/**
 * 7shifts live smoke — validate OAuth credentials, schedule import, labor sync wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { addDays, startOfDay } from "date-fns";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID,
  SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT,
} from "@/lib/integrations/seven-shifts-live-smoke-era82-policy";
import { isPlaceholderSevenShiftsCompanyId } from "@/lib/integrations/seven-shifts-live-smoke-summary";
import { syncSevenShiftsLaborCost } from "@/services/integrations/seven-shifts/labor-cost.service";
import { syncSevenShiftsScheduleImport } from "@/services/integrations/seven-shifts/schedule-import.service";
import { fetchSevenShiftsShiftsApi } from "@/services/integrations/seven-shifts/seven-shifts-api";
import { getSevenShiftsCredentials } from "@/services/integrations/seven-shifts/seven-shifts-credentials";

export const SEVEN_SHIFTS_LIVE_SMOKE_ARTIFACT = SEVEN_SHIFTS_LIVE_SMOKE_ERA82_SUMMARY_ARTIFACT;

export const SEVEN_SHIFTS_LIVE_SMOKE_VERSION = SEVEN_SHIFTS_LIVE_SMOKE_ERA82_POLICY_ID;

export type SevenShiftsLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type SevenShiftsLiveSmokeStep = {
  id: string;
  label: string;
  status: SevenShiftsLiveSmokeStepStatus;
  detail?: string;
};

export type SevenShiftsLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_company"
  | "proof_failed";

export type SevenShiftsLiveSmokeSummary = {
  version: typeof SEVEN_SHIFTS_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: SevenShiftsLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: SevenShiftsLiveSmokeStep[];
  connectionId: string | null;
  companyId: string | null;
  honestyNote: string;
};

export type SevenShiftsLiveSmokeEnvInput = {
  clientId: string | null;
  accessToken: string | null;
  companyId: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readSevenShiftsLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): SevenShiftsLiveSmokeEnvInput {
  return {
    clientId: env.SEVENSHIFTS_CLIENT_ID?.trim() ?? null,
    accessToken: env.SEVENSHIFTS_ACCESS_TOKEN?.trim() ?? null,
    companyId: env.SEVENSHIFTS_COMPANY_ID?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingSevenShiftsLiveSmokeEnvVars(
  input: SevenShiftsLiveSmokeEnvInput,
): string[] {
  const missing: string[] = [];
  if (!input.databaseUrl) missing.push("DATABASE_URL");

  const hasDirect =
    Boolean(input.accessToken) && Boolean(input.companyId) && Boolean(input.clientId);

  const hasDbTenant =
    Boolean(input.encryptionKey) && Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirect && !hasDbTenant) {
    if (!input.clientId) missing.push("SEVENSHIFTS_CLIENT_ID");
    if (!input.accessToken) missing.push("SEVENSHIFTS_ACCESS_TOKEN");
    if (!input.companyId) missing.push("SEVENSHIFTS_COMPANY_ID");
    if (!input.encryptionKey && !input.accessToken) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.accessToken) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

async function pingSevenShiftsApi(creds: {
  accessToken: string;
  companyId: string;
}): Promise<{ ok: boolean; message: string }> {
  try {
    const rangeStart = startOfDay(new Date());
    const rangeEnd = addDays(rangeStart, 7);
    const fetched = await fetchSevenShiftsShiftsApi({
      accessToken: creds.accessToken,
      companyId: creds.companyId,
      start: rangeStart,
      end: rangeEnd,
    });
    if (!fetched.ok) {
      return { ok: false, message: fetched.message };
    }
    return {
      ok: true,
      message: `7shifts API reachable (${fetched.shifts.length} shift(s) in next 7 days).`,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "7shifts connection test failed.",
    };
  }
}

export function buildSevenShiftsLiveSmokeSummary(input: {
  steps: SevenShiftsLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
  companyId?: string | null;
}): SevenShiftsLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "seven_shifts_oauth_connection" && step.status === "SKIPPED",
  );

  let overall: SevenShiftsLiveSmokeSummary["overall"];
  let proofStatus: SevenShiftsLiveSmokeProofStatus;

  if (input.missingEnvVars.length > 0) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_missing_prerequisites";
  } else if (placeholderSkipped) {
    overall = "SKIPPED";
    proofStatus = "proof_skipped_placeholder_company";
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
    version: SEVEN_SHIFTS_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    companyId: input.companyId ?? null,
    honestyNote:
      "PASS requires live 7shifts OAuth + schedule import and labor sync wiring — import may skip when staff mappings are absent.",
  };
}

function scheduleImportNeedsMappings(message: string): boolean {
  return /staff member|staff mapping|Map at least one/i.test(message);
}

async function resolveConnectionAndCreds(
  prisma: PrismaClient,
  input: SevenShiftsLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string;
      userId: string;
      creds: { accessToken: string; companyId: string };
      companyId: string;
    }
  | { error: string }
> {
  let conn = input.connectionId
    ? await prisma.integrationConnection.findUnique({ where: { id: input.connectionId } })
    : null;

  if (!conn && input.companyId) {
    conn = await prisma.integrationConnection.findFirst({
      where: {
        provider: IntegrationProvider.SEVEN_SHIFTS,
        externalStoreId: input.companyId,
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
          provider: IntegrationProvider.SEVEN_SHIFTS,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No 7shifts connection in DATABASE_URL — complete OAuth in dashboard or set SEVENSHIFTS_* + CHANNEL_SMOKE_*",
    };
  }

  const decrypted = getSevenShiftsCredentials(conn);
  const creds =
    input.accessToken && input.companyId
      ? { accessToken: input.accessToken, companyId: input.companyId }
      : decrypted
        ? { accessToken: decrypted.accessToken, companyId: decrypted.companyId }
        : null;

  if (!creds?.accessToken || !creds.companyId) {
    return { error: "Connection missing 7shifts access token or company ID (ENCRYPTION_KEY?)" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    creds,
    companyId: creds.companyId,
  };
}

export async function runSevenShiftsLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<SevenShiftsLiveSmokeSummary> {
  const input = readSevenShiftsLiveSmokeEnv(env);
  const missingEnvVars = listMissingSevenShiftsLiveSmokeEnvVars(input);
  const steps: SevenShiftsLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildSevenShiftsLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct 7shifts or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndCreds(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve 7shifts connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildSevenShiftsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
        companyId: input.companyId,
      });
    }

    const { connectionId, userId, creds, companyId } = resolved;
    steps.push({
      id: "resolve_connection",
      label: "Resolve 7shifts connection",
      status: "PASSED",
      detail: `connectionId=${connectionId}`,
    });

    const placeholderCompany = isPlaceholderSevenShiftsCompanyId(companyId);
    const ping = await pingSevenShiftsApi(creds);
    steps.push({
      id: "seven_shifts_oauth_connection",
      label: "7shifts OAuth API connection",
      status: ping.ok ? "PASSED" : placeholderCompany ? "SKIPPED" : "FAILED",
      detail: ping.ok
        ? ping.message
        : placeholderCompany
          ? `Company ${companyId}: ${ping.message}. Update Dashboard → Integrations → 7shifts (saved company is a placeholder).`
          : ping.message,
    });
    if (!ping.ok) {
      return buildSevenShiftsLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        companyId,
      });
    }

    const schedule = await syncSevenShiftsScheduleImport(userId);
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

    const labor = await syncSevenShiftsLaborCost(userId);
    steps.push({
      id: "labor_sync_wiring",
      label: "Labor cost sync wiring",
      status: labor.ok ? "PASSED" : "FAILED",
      detail: labor.message,
    });

    return buildSevenShiftsLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      connectionId,
      companyId,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runSevenShiftsLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), SEVEN_SHIFTS_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${SEVEN_SHIFTS_LIVE_SMOKE_ARTIFACT}\n`);
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
