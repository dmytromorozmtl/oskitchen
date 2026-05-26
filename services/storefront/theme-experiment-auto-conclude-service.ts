import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import {
  sendExperimentAutoConcludeApprovalEmail,
  sendExperimentAutoConcludeExecutedEmail,
  sendExperimentAutoConcludeScheduledEmail,
} from "@/lib/email/experiment-auto-conclude";
import {
  autoConcludeApprovalUrls,
  generateAutoConcludeApprovalToken,
  hashAutoConcludeApprovalToken,
} from "@/lib/storefront/theme-experiment-auto-conclude-approval";
import { mergeGa4ParityIntoJson } from "@/lib/storefront/ga4-parity-json";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import {
  DEFAULT_EXPERIMENT_DECISION_THRESHOLDS,
  evaluateExperimentProdDecision,
} from "@/lib/storefront/theme-experiment-decision";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { edgeVersionMatchesExpected } from "@/lib/storefront/theme-experiment-edge-verify";
import { evaluateExperimentSrm } from "@/lib/storefront/theme-experiment-srm";
import {
  autoConcludeGraceMs,
  evaluateAutoConcludeReadiness,
  isAutoConcludeGloballyEnabled,
  readAutoConcludeEnabled,
} from "@/lib/storefront/theme-experiment-auto-conclude";
import { isThemeExperimentPipelineActive } from "@/lib/storefront/theme-experiment-pipeline";
import { countBlockingEdgeSyncJobs } from "@/services/storefront/storefront-edge-sync-job-service";
import { refreshGa4ParityForStorefront } from "@/services/storefront/ga4-parity-refresh-service";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";
import { readEdgeExperimentVersion } from "@/services/storefront/theme-experiment-edge-sync";
import { sendExperimentSlackApprovalMessage } from "@/lib/storefront/experiment-slack-approval";
import {
  readWorkspaceExperimentPolicy,
  resolveAutoConcludeRequireApproval,
  resolveMinLiftPp,
} from "@/lib/storefront/theme-experiment-workspace-policy";
import { publishStorefrontThemeSnapshot } from "@/services/storefront/storefront-theme-publish-service";

const LOOKBACK_DAYS = 7;

function readPendingApprovalHash(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const v = (raw as Record<string, unknown>).autoConcludeApprovalTokenHash;
  return typeof v === "string" ? v : null;
}

async function recentlyAutoConcluded(storeSlug: string): Promise<boolean> {
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const hit = await prisma.auditLog.findFirst({
    where: {
      action: { in: ["storefront.experiment.auto_conclude", "storefront.experiment.apply_winner"] },
      createdAt: { gte: since },
      metadataJson: { path: ["storeSlug"], equals: storeSlug },
    },
    select: { id: true },
  });
  return Boolean(hit);
}

async function recordAutoConcludeAudit(input: {
  storefrontId: string;
  storeSlug: string;
  phase: "scheduled" | "executed" | "blocked";
  detail?: string;
}) {
  const { auditLog } = await import("@/services/audit/audit-service");
  await auditLog({
    actor: { userId: null, email: null },
    action:
      input.phase === "executed"
        ? "storefront.experiment.auto_conclude"
        : "storefront.experiment.auto_conclude_scheduled",
    category: "SETTINGS",
    source: "SYSTEM",
    severity: input.phase === "blocked" ? "INFO" : "WARNING",
    entity: { type: "storefront_settings", id: input.storefrontId, label: input.storeSlug },
    metadata: { storeSlug: input.storeSlug, phase: input.phase, detail: input.detail ?? null },
  });
}

export async function runThemeExperimentAutoConcludeCycle(): Promise<{
  checked: number;
  scheduled: number;
  executed: number;
  skipped: number;
  dryRun: boolean;
}> {
  if (!isAutoConcludeGloballyEnabled()) {
    return { checked: 0, scheduled: 0, executed: 0, skipped: 0, dryRun: false };
  }

  const dryRun = process.env.THEME_EXPERIMENT_AUTO_CONCLUDE_DRY_RUN === "1";
  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: {
      id: true,
      userId: true,
      storeSlug: true,
      publicName: true,
      workspaceId: true,
      themeExperimentJson: true,
      googleAnalyticsPropertyId: true,
    },
  });

  let checked = 0;
  let scheduled = 0;
  let executed = 0;
  let skipped = 0;

  for (const sf of storefronts) {
    const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
    if (!exp?.enabled || !readAutoConcludeEnabled(sf.themeExperimentJson)) {
      skipped++;
      continue;
    }

    const pipelineActive = await isThemeExperimentPipelineActive({
      workspaceId: sf.workspaceId,
      themeExperimentJson: sf.themeExperimentJson,
    });
    if (!pipelineActive) {
      skipped++;
      continue;
    }

    checked++;

    const workspacePolicy = await readWorkspaceExperimentPolicy(sf.workspaceId);
    const armMetrics = await getThemeExperimentArmMetrics(sf.id, LOOKBACK_DAYS);
    const decision = evaluateExperimentProdDecision(
      armMetrics,
      {
        ...DEFAULT_EXPERIMENT_DECISION_THRESHOLDS,
        minLiftPp: resolveMinLiftPp(workspacePolicy),
      },
      { themeExperimentJson: sf.themeExperimentJson },
    );
    const srm = evaluateExperimentSrm(armMetrics, exp.trafficPercent ?? 50);

    const parityResult = await refreshGa4ParityForStorefront({
      storefrontId: sf.id,
      themeExperimentJson: sf.themeExperimentJson,
      googleAnalyticsPropertyId: sf.googleAnalyticsPropertyId,
      days: LOOKBACK_DAYS,
      force: false,
      recordHistory: false,
      updateDriftStreak: false,
    });

    const dbVersion = getThemeExperimentVersion(sf.themeExperimentJson);
    const edgeVersion = await readEdgeExperimentVersion(sf.storeSlug);
    const edgeSynced = edgeVersionMatchesExpected({
      experimentEnabled: true,
      expectedVersion: dbVersion,
      edgeVersion,
    });
    const blockingEdgeJobs = await countBlockingEdgeSyncJobs(sf.id);

    const readiness = evaluateAutoConcludeReadiness({
      themeExperimentJson: sf.themeExperimentJson,
      decision,
      parity: parityResult.score,
      srm,
      edgeSynced,
      blockingEdgeJobs,
      experimentEnabled: true,
    });

    const profile = await prisma.userProfile.findUnique({
      where: { id: sf.userId },
      select: { email: true },
    });
    const ownerEmail = profile?.email?.trim() ?? null;

    if (!readiness.allPassed) {
      const merged = mergeGa4ParityIntoJson(sf.themeExperimentJson, {
        clearAutoConcludeSchedule: true,
      });
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: merged as object },
      });
      skipped++;
      continue;
    }

    if (!readiness.scheduledAt) {
      const scheduledAt = new Date(Date.now() + autoConcludeGraceMs()).toISOString();
      const merged = mergeGa4ParityIntoJson(sf.themeExperimentJson, {
        autoConcludeScheduledAt: scheduledAt,
      });
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: merged as object },
      });

      if (!dryRun) {
        await recordAutoConcludeAudit({
          storefrontId: sf.id,
          storeSlug: sf.storeSlug,
          phase: "scheduled",
          detail: scheduledAt,
        });
        if (ownerEmail) {
          await sendExperimentAutoConcludeScheduledEmail({
            to: ownerEmail,
            storeName: sf.publicName,
            storeSlug: sf.storeSlug,
            scheduledAt,
            liftPp: decision.liftPp,
          });
        }
      }
      scheduled++;
      continue;
    }

    if (!readiness.executeNow) {
      skipped++;
      continue;
    }

    if (await recentlyAutoConcluded(sf.storeSlug)) {
      skipped++;
      continue;
    }

    const requireApproval = resolveAutoConcludeRequireApproval({
      workspacePolicy,
      storeAutoConcludeEnabled: readAutoConcludeEnabled(sf.themeExperimentJson),
    });
    const pendingHash = readPendingApprovalHash(sf.themeExperimentJson);
    if (requireApproval && !pendingHash) {
      const token = generateAutoConcludeApprovalToken();
      const tokenHash = hashAutoConcludeApprovalToken(token);
      const merged = mergeGa4ParityIntoJson(sf.themeExperimentJson, {
        autoConcludeApprovalTokenHash: tokenHash,
      });
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: merged as object },
      });
      if (!dryRun) {
        if (ownerEmail) {
          const urls = autoConcludeApprovalUrls(token);
          await sendExperimentAutoConcludeApprovalEmail({
            to: ownerEmail,
            storeName: sf.publicName,
            storeSlug: sf.storeSlug,
            liftPp: decision.liftPp,
            approveUrl: urls.approve,
            rejectUrl: urls.reject,
          });
        }
        await sendExperimentSlackApprovalMessage({
          storeSlug: sf.storeSlug,
          storefrontId: sf.id,
          liftPp: decision.liftPp,
          approveToken: token,
          rejectToken: token,
        });
        await recordAutoConcludeAudit({
          storefrontId: sf.id,
          storeSlug: sf.storeSlug,
          phase: "scheduled",
          detail: "approval_email_sent",
        });
      }
      scheduled++;
      continue;
    }

    if (requireApproval && pendingHash) {
      skipped++;
      continue;
    }

    if (dryRun) {
      executed++;
      continue;
    }

    const publish = await publishStorefrontThemeSnapshot({
      userId: sf.userId,
      storefrontId: sf.id,
    });

    if (!publish.ok) {
      await recordAutoConcludeAudit({
        storefrontId: sf.id,
        storeSlug: sf.storeSlug,
        phase: "blocked",
        detail: publish.error,
      });
      skipped++;
      continue;
    }

    const fresh = await prisma.storefrontSettings.findUnique({
      where: { id: sf.id },
      select: { themeExperimentJson: true },
    });
    const cleared = mergeGa4ParityIntoJson(fresh?.themeExperimentJson, {
      clearAutoConcludeSchedule: true,
      autoConcludeScheduledAt: null,
      autoConcludeApprovalTokenHash: null,
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: cleared as object },
    });

    await recordAutoConcludeAudit({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      phase: "executed",
    });

    if (ownerEmail) {
      await sendExperimentAutoConcludeExecutedEmail({
        to: ownerEmail,
        storeName: sf.publicName,
        storeSlug: sf.storeSlug,
        liftPp: decision.liftPp,
      });
    }

    executed++;
  }

  return { checked, scheduled, executed, skipped, dryRun };
}
