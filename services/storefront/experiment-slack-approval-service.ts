import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { hashAutoConcludeApprovalToken } from "@/lib/storefront/theme-experiment-auto-conclude-approval";
import { mergeGa4ParityIntoJson } from "@/lib/storefront/ga4-parity-json";
import { readPostPublishGuard } from "@/lib/storefront/theme-experiment-post-publish-guard";
import { hashRollbackToken } from "@/services/storefront/experiment-post-publish-guard-service";
import {
  applyFullThemeRollback,
  applyPartialThemeRollback,
  hashPartialRollbackToken,
} from "@/services/storefront/experiment-partial-rollback-service";
import { publishStorefrontThemeSnapshot } from "@/services/storefront/storefront-theme-publish-service";

export async function executeExperimentApprovalAction(input: {
  actionId: string;
  value: string;
  responseUrl?: string;
  slackUser?: string;
}): Promise<{ ok: boolean; detail?: string; message?: string }> {
  const token = input.value?.trim();
  if (!token) return { ok: false, detail: "missing_token" };

  const rollbackActions = new Set([
    "experiment_rollback_confirm",
    "experiment_rollback_keep",
    "experiment_partial_revert",
    "experiment_full_revert",
  ]);

  let sf: {
    id: string;
    userId: string;
    storeSlug: string;
    themeExperimentJson: unknown;
  } | null = null;

  if (rollbackActions.has(input.actionId)) {
    const rollbackHash = hashRollbackToken(token);
    const partialHash = hashPartialRollbackToken(token);
    sf = await prisma.storefrontSettings.findFirst({
      where: {
        OR: [
          { themeExperimentJson: { path: ["postPublishGuard", "rollbackTokenHash"], equals: rollbackHash } },
          { themeExperimentJson: { path: ["partialRollbackTokenHash"], equals: partialHash } },
        ],
      },
      select: { id: true, userId: true, storeSlug: true, themeExperimentJson: true },
    });
  } else {
    const hash = hashAutoConcludeApprovalToken(token);
    sf = await prisma.storefrontSettings.findFirst({
      where: {
        themeExperimentJson: { path: ["autoConcludeApprovalTokenHash"], equals: hash },
      },
      select: { id: true, userId: true, storeSlug: true, themeExperimentJson: true },
    });
  }

  if (!sf) {
    return { ok: false, detail: "invalid_token", message: "Link expired or already used." };
  }

  if (input.actionId === "experiment_reject") {
    const merged = mergeGa4ParityIntoJson(sf.themeExperimentJson, {
      clearAutoConcludeSchedule: true,
      autoConcludeScheduledAt: null,
      autoConcludeApprovalTokenHash: null,
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    return {
      ok: true,
      message: `Rejected auto-conclude for \`${sf.storeSlug}\` by ${input.slackUser ?? "user"}.`,
    };
  }

  if (input.actionId === "experiment_partial_revert") {
    const raw =
      sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
        ? (sf.themeExperimentJson as Record<string, unknown>)
        : {};
    const partialHash = typeof raw.partialRollbackTokenHash === "string" ? raw.partialRollbackTokenHash : null;
    if (!partialHash || hashPartialRollbackToken(token) !== partialHash) {
      return { ok: false, detail: "invalid_partial_token", message: "Invalid partial revert token." };
    }
    const applied = await applyPartialThemeRollback(sf.id);
    if (!applied.ok) {
      return { ok: false, detail: applied.error, message: `Partial revert failed: ${applied.error}` };
    }
    return {
      ok: true,
      message: `Partial revert applied for \`${sf.storeSlug}\` — layout tokens only; copy/pricing kept from winner.`,
    };
  }

  if (input.actionId === "experiment_full_revert") {
    const raw =
      sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
        ? (sf.themeExperimentJson as Record<string, unknown>)
        : {};
    const partialHash = typeof raw.partialRollbackTokenHash === "string" ? raw.partialRollbackTokenHash : null;
    if (!partialHash || hashPartialRollbackToken(token) !== partialHash) {
      return { ok: false, detail: "invalid_full_token", message: "Invalid full revert token." };
    }
    const applied = await applyFullThemeRollback(sf.id);
    if (!applied.ok) {
      return { ok: false, detail: applied.error, message: `Full revert failed: ${applied.error}` };
    }
    return {
      ok: true,
      message: `Full revert applied for \`${sf.storeSlug}\` — entire published snapshot restored.`,
    };
  }

  if (input.actionId === "experiment_rollback_confirm") {
    const guard = readPostPublishGuard(sf.themeExperimentJson);
    if (!guard?.rollbackPending || !guard.rollbackTokenHash) {
      return { ok: false, detail: "no_rollback_pending", message: "No rollback pending." };
    }
    if (hashRollbackToken(token) !== guard.rollbackTokenHash) {
      return { ok: false, detail: "invalid_rollback_token", message: "Invalid rollback token." };
    }
    const partial = await applyPartialThemeRollback(sf.id);
    const base =
      sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
        ? { ...(sf.themeExperimentJson as Record<string, unknown>) }
        : {};
    base.postPublishGuard = {
      ...guard,
      rollbackPending: false,
      frozenUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: base as object },
    });
    return {
      ok: true,
      message: partial.ok
        ? `Partial revert (default) for \`${sf.storeSlug}\` — layout only; auto-conclude frozen 7d.`
        : `Rollback confirmed for \`${sf.storeSlug}\` — auto-conclude frozen 7d.`,
    };
  }

  if (input.actionId === "experiment_rollback_keep") {
    const guard = readPostPublishGuard(sf.themeExperimentJson);
    const base =
      sf.themeExperimentJson && typeof sf.themeExperimentJson === "object" && !Array.isArray(sf.themeExperimentJson)
        ? { ...(sf.themeExperimentJson as Record<string, unknown>) }
        : {};
    if (guard) {
      base.postPublishGuard = { ...guard, rollbackPending: false };
    }
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: base as object },
    });
    return {
      ok: true,
      message: `Keeping winner for \`${sf.storeSlug}\` despite regression signal.`,
    };
  }

  if (input.actionId === "experiment_approve" || input.actionId === "experiment_approve_bulk") {
    const publish = await publishStorefrontThemeSnapshot({
      userId: sf.userId,
      storefrontId: sf.id,
    });
    if (!publish.ok) {
      return { ok: false, detail: publish.error, message: `Publish failed: ${publish.error}` };
    }

    const fresh = await prisma.storefrontSettings.findUnique({
      where: { id: sf.id },
      select: { themeExperimentJson: true },
    });
    const merged = mergeGa4ParityIntoJson(fresh?.themeExperimentJson, {
      clearAutoConcludeSchedule: true,
      autoConcludeScheduledAt: null,
      autoConcludeApprovalTokenHash: null,
    });
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });

    const { auditLog } = await import("@/services/audit/audit-service");
    await auditLog({
      actor: { userId: sf.userId, email: null },
      action: "storefront.experiment.auto_conclude_approved",
      category: "SETTINGS",
      source: "USER",
      entity: { type: "storefront_settings", id: sf.id, label: sf.storeSlug },
      metadata: { storeSlug: sf.storeSlug, via: "slack_interactive", slackUser: input.slackUser ?? null },
    });

    return {
      ok: true,
      message: `Winner applied for \`${sf.storeSlug}\` by ${input.slackUser ?? "user"}.`,
    };
  }

  return { ok: true, detail: "noop" };
}
