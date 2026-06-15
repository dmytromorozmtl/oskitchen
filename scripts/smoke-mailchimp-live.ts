/**
 * Mailchimp live smoke — validate OAuth credentials, email list, campaign automation wiring.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";

import { PrismaClient, IntegrationProvider } from "@prisma/client";

loadSmokeEnv();

import {
  MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID,
  MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT,
} from "@/lib/integrations/mailchimp-live-smoke-era85-policy";
import { isPlaceholderMailchimpAccessToken } from "@/lib/integrations/mailchimp-live-smoke-summary";
import { listMailchimpCampaignAutomations } from "@/services/integrations/mailchimp/campaign-automation.service";
import {
  fetchMailchimpAutomations,
  fetchMailchimpLists,
  fetchMailchimpOAuthMetadata,
} from "@/services/integrations/mailchimp/mailchimp-api";
import { getMailchimpCredentials } from "@/services/integrations/mailchimp/mailchimp-credentials";

export const MAILCHIMP_LIVE_SMOKE_ARTIFACT = MAILCHIMP_LIVE_SMOKE_ERA85_SUMMARY_ARTIFACT;

export const MAILCHIMP_LIVE_SMOKE_VERSION = MAILCHIMP_LIVE_SMOKE_ERA85_POLICY_ID;

export type MailchimpLiveSmokeStepStatus = "PASSED" | "FAILED" | "SKIPPED";

export type MailchimpLiveSmokeStep = {
  id: string;
  label: string;
  status: MailchimpLiveSmokeStepStatus;
  detail?: string;
};

export type MailchimpLiveSmokeProofStatus =
  | "proof_passed"
  | "proof_skipped_missing_prerequisites"
  | "proof_skipped_placeholder_token"
  | "proof_failed";

export type MailchimpLiveSmokeSummary = {
  version: typeof MAILCHIMP_LIVE_SMOKE_VERSION;
  runAt: string;
  overall: "PASSED" | "FAILED" | "SKIPPED";
  proofStatus: MailchimpLiveSmokeProofStatus;
  missingEnvVars: string[];
  steps: MailchimpLiveSmokeStep[];
  connectionId: string | null;
  accountName: string | null;
  honestyNote: string;
};

export type MailchimpLiveSmokeEnvInput = {
  clientId: string | null;
  accessToken: string | null;
  connectionId: string | null;
  databaseUrl: string | null;
  encryptionKey: string | null;
  ownerEmail: string | null;
};

export function readMailchimpLiveSmokeEnv(
  env: NodeJS.ProcessEnv = process.env,
): MailchimpLiveSmokeEnvInput {
  return {
    clientId: env.MAILCHIMP_CLIENT_ID?.trim() ?? null,
    accessToken: env.MAILCHIMP_ACCESS_TOKEN?.trim() ?? null,
    connectionId: env.CHANNEL_SMOKE_CONNECTION_ID?.trim() ?? null,
    databaseUrl: env.DATABASE_URL?.trim() ?? null,
    encryptionKey: env.ENCRYPTION_KEY?.trim() ?? null,
    ownerEmail: env.CHANNEL_SMOKE_OWNER_EMAIL?.trim() ?? null,
  };
}

export function listMissingMailchimpLiveSmokeEnvVars(input: MailchimpLiveSmokeEnvInput): string[] {
  const missing: string[] = [];
  if (!input.databaseUrl) missing.push("DATABASE_URL");

  const hasDirect = Boolean(input.accessToken);
  const hasDbTenant =
    Boolean(input.encryptionKey) && Boolean(input.connectionId || input.ownerEmail);

  if (!hasDirect && !hasDbTenant) {
    if (!input.accessToken) missing.push("MAILCHIMP_ACCESS_TOKEN");
    if (!input.encryptionKey && !input.accessToken) missing.push("ENCRYPTION_KEY");
    if (!input.connectionId && !input.ownerEmail) {
      missing.push("CHANNEL_SMOKE_CONNECTION_ID");
      if (!input.accessToken) missing.push("CHANNEL_SMOKE_OWNER_EMAIL");
    }
  }

  return [...new Set(missing)];
}

export function buildMailchimpLiveSmokeSummary(input: {
  steps: MailchimpLiveSmokeStep[];
  missingEnvVars: string[];
  connectionId?: string | null;
  accountName?: string | null;
}): MailchimpLiveSmokeSummary {
  const failed = input.steps.some((s) => s.status === "FAILED");
  const skippedOnly =
    input.missingEnvVars.length > 0 || input.steps.every((s) => s.status === "SKIPPED");

  const placeholderSkipped = input.steps.some(
    (step) => step.id === "mailchimp_oauth_connection" && step.status === "SKIPPED",
  );

  let overall: MailchimpLiveSmokeSummary["overall"];
  let proofStatus: MailchimpLiveSmokeProofStatus;

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
    version: MAILCHIMP_LIVE_SMOKE_VERSION,
    runAt: new Date().toISOString(),
    overall,
    proofStatus,
    missingEnvVars: input.missingEnvVars,
    steps: input.steps,
    connectionId: input.connectionId ?? null,
    accountName: input.accountName ?? null,
    honestyNote:
      "PASS requires live Mailchimp OAuth + audience list and automation list wiring — automation trigger is list-only dry-run.",
  };
}

async function resolveConnectionAndToken(
  prisma: PrismaClient,
  input: MailchimpLiveSmokeEnvInput,
): Promise<
  | {
      connectionId: string | null;
      userId: string | null;
      accessToken: string;
      apiEndpoint: string | null;
    }
  | { error: string }
> {
  if (input.accessToken) {
    const metadata = await fetchMailchimpOAuthMetadata(input.accessToken);
    return {
      connectionId: input.connectionId,
      userId: null,
      accessToken: input.accessToken,
      apiEndpoint: metadata.ok ? metadata.apiEndpoint : null,
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
          provider: IntegrationProvider.MAILCHIMP,
        },
        orderBy: { updatedAt: "desc" },
      });
    }
  }

  if (!conn) {
    return {
      error:
        "No Mailchimp connection in DATABASE_URL — complete OAuth in dashboard or set MAILCHIMP_ACCESS_TOKEN + CHANNEL_SMOKE_*",
    };
  }

  const creds = getMailchimpCredentials(conn);
  if (!creds?.accessToken || !creds.apiEndpoint) {
    return { error: "Connection missing Mailchimp access token or API endpoint (ENCRYPTION_KEY?)" };
  }

  return {
    connectionId: conn.id,
    userId: conn.userId,
    accessToken: creds.accessToken,
    apiEndpoint: creds.apiEndpoint,
  };
}

export async function runMailchimpLiveSmoke(
  env: NodeJS.ProcessEnv = process.env,
): Promise<MailchimpLiveSmokeSummary> {
  const input = readMailchimpLiveSmokeEnv(env);
  const missingEnvVars = listMissingMailchimpLiveSmokeEnvVars(input);
  const steps: MailchimpLiveSmokeStep[] = [];

  if (missingEnvVars.length > 0) {
    steps.push({
      id: "env_validation",
      label: "Prerequisite env vars",
      status: "SKIPPED",
      detail: `Missing: ${missingEnvVars.join(", ")}`,
    });
    return buildMailchimpLiveSmokeSummary({ steps, missingEnvVars });
  }

  steps.push({
    id: "env_validation",
    label: "Prerequisite env vars",
    status: "PASSED",
    detail: "Direct Mailchimp or DB tenant path satisfied",
  });

  const prisma = new PrismaClient();
  try {
    const resolved = await resolveConnectionAndToken(prisma, input);
    if ("error" in resolved) {
      steps.push({
        id: "resolve_connection",
        label: "Resolve Mailchimp connection",
        status: "FAILED",
        detail: resolved.error,
      });
      return buildMailchimpLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId: input.connectionId,
      });
    }

    const { connectionId, userId, accessToken } = resolved;
    steps.push({
      id: "resolve_connection",
      label: "Resolve Mailchimp connection",
      status: "PASSED",
      detail: connectionId ? `connectionId=${connectionId}` : "Direct MAILCHIMP_ACCESS_TOKEN",
    });

    const placeholderToken = isPlaceholderMailchimpAccessToken(accessToken);
    const metadata = await fetchMailchimpOAuthMetadata(accessToken);
    steps.push({
      id: "mailchimp_oauth_connection",
      label: "Mailchimp OAuth API connection",
      status: metadata.ok ? "PASSED" : placeholderToken ? "SKIPPED" : "FAILED",
      detail: metadata.ok
        ? `Mailchimp API reachable (${metadata.accountName}, dc=${metadata.datacenter}).`
        : placeholderToken
          ? `Placeholder token: ${metadata.error}. Replace with live OAuth token in vault.`
          : metadata.error,
    });
    if (!metadata.ok) {
      return buildMailchimpLiveSmokeSummary({
        steps,
        missingEnvVars: [],
        connectionId,
        accountName: null,
      });
    }

    const lists = await fetchMailchimpLists(metadata.apiEndpoint, accessToken);
    steps.push({
      id: "email_list_wiring",
      label: "Email list wiring",
      status: "PASSED",
      detail: `Listed ${lists.length} audience(s).`,
    });

    if (userId) {
      const automations = await listMailchimpCampaignAutomations(userId);
      steps.push({
        id: "campaign_automation_wiring",
        label: "Campaign automation wiring",
        status: automations.ok ? "PASSED" : "FAILED",
        detail: automations.ok
          ? `Listed ${automations.automations.length} automation(s) via service wiring.`
          : automations.error,
      });
    } else {
      const automations = await fetchMailchimpAutomations(metadata.apiEndpoint, accessToken);
      steps.push({
        id: "campaign_automation_wiring",
        label: "Campaign automation wiring (dry-run list)",
        status: "PASSED",
        detail: `Listed ${automations.length} automation(s) — no live trigger queued.`,
      });
    }

    return buildMailchimpLiveSmokeSummary({
      steps,
      missingEnvVars: [],
      connectionId,
      accountName: metadata.accountName,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const writeArtifact = process.argv.includes("--write");
  const summary = await runMailchimpLiveSmoke();

  for (const step of summary.steps) {
    console.log(
      `  [${step.status}] ${step.label}${step.detail ? ` — ${step.detail}` : ""}`,
    );
  }
  console.log(`\nOverall: ${summary.overall} | proofStatus: ${summary.proofStatus}\n`);

  if (writeArtifact) {
    const path = join(process.cwd(), MAILCHIMP_LIVE_SMOKE_ARTIFACT);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
    console.log(`Wrote ${MAILCHIMP_LIVE_SMOKE_ARTIFACT}\n`);
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
