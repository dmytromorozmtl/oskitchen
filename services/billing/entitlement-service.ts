import type { EntitlementOverride } from "@prisma/client";

import {
  applyOverrides,
  FEATURE_FLAGS,
  type FeatureFlag,
} from "@/lib/billing/entitlements";
import type { PlanKey } from "@/lib/billing/plan-registry";
import { limitForMetric, USAGE_METRICS, type UsageMetric } from "@/lib/billing/usage-limits";
import { ensurePlatformOwnerBootstrap } from "@/lib/platform-admin";
import { hasSuperAdminRoleRow } from "@/lib/platform-super-bypass";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { entitlementOverrideListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { loadSubscription } from "@/services/billing/subscription-service";

export type EntitlementSnapshot = {
  plan: PlanKey;
  superadmin: boolean;
  features: Record<FeatureFlag, boolean>;
  overridesActive: FeatureFlag[];
};

export type DowngradeBlockerRow = {
  metric: UsageMetric;
  used: number;
  targetLimit: number | null;
  blocked: boolean;
};

function parseBoolJson(j: unknown): boolean | undefined {
  if (typeof j === "boolean") return j;
  if (j && typeof j === "object" && "enabled" in (j as object)) {
    return Boolean((j as { enabled?: boolean }).enabled);
  }
  return undefined;
}

export async function listOverrides(userId: string): Promise<EntitlementOverride[]> {
  const where = await entitlementOverrideListWhereForOwner(userId);
  return prisma.entitlementOverride.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
}

export async function entitlementSnapshot(userId: string): Promise<EntitlementSnapshot> {
  const [sub, profile, overrideWhere] = await Promise.all([
    loadSubscription(userId),
    prisma.userProfile.findUnique({ where: { id: userId }, select: { email: true } }),
    entitlementOverrideListWhereForOwner(userId),
  ]);
  const rows = await prisma.entitlementOverride.findMany({ where: overrideWhere });

  const plan = sub.plan as PlanKey;
  await ensurePlatformOwnerBootstrap(userId, profile?.email ?? null);
  const superadmin = await hasSuperAdminRoleRow(userId);
  const now = Date.now();

  const overrideMap: Partial<Record<FeatureFlag, boolean>> = {};
  const overridesActive: FeatureFlag[] = [];

  for (const r of rows) {
    if (r.expiresAt && r.expiresAt.getTime() < now) continue;
    const fk = r.featureKey as FeatureFlag;
    if (!FEATURE_FLAGS.includes(fk)) continue;
    const v = parseBoolJson(r.valueJson);
    if (typeof v === "boolean") {
      overrideMap[fk] = v;
      overridesActive.push(fk);
    }
  }

  const merged = applyOverrides(plan, overrideMap);
  const features = {} as Record<FeatureFlag, boolean>;
  for (const flag of FEATURE_FLAGS) {
    features[flag] = Boolean(merged[flag]);
  }
  if (superadmin) {
    for (const flag of FEATURE_FLAGS) {
      features[flag] = true;
    }
  }

  return { plan, superadmin, features, overridesActive };
}

export async function setEntitlementOverride(params: {
  userId: string;
  featureKey: FeatureFlag;
  value: boolean;
  reason: string | null;
  expiresAt: Date | null;
  createdById: string;
}): Promise<void> {
  const workspaceId = await resolveOwnerWorkspaceId(params.userId);
  await prisma.entitlementOverride.upsert({
    where: {
      userId_featureKey: { userId: params.userId, featureKey: params.featureKey },
    },
    create: {
      userId: params.userId,
      workspaceId,
      featureKey: params.featureKey,
      valueJson: params.value,
      reason: params.reason ?? undefined,
      expiresAt: params.expiresAt ?? undefined,
      createdById: params.createdById,
    },
    update: {
      valueJson: params.value,
      reason: params.reason ?? undefined,
      expiresAt: params.expiresAt ?? undefined,
      createdById: params.createdById,
    },
  });
}

export async function clearEntitlementOverride(params: {
  userId: string;
  featureKey: FeatureFlag;
  performedById: string;
}): Promise<void> {
  void params.performedById;
  const overrideScope = await entitlementOverrideListWhereForOwner(params.userId);
  await prisma.entitlementOverride.deleteMany({
    where: { AND: [overrideScope, { featureKey: params.featureKey }] },
  });
}

export function downgradeBlockers(
  target: PlanKey,
  counts: Record<UsageMetric, number>,
): DowngradeBlockerRow[] {
  return USAGE_METRICS.map((metric) => {
    const used = counts[metric];
    const targetLimit = limitForMetric(target, metric);
    const blocked = targetLimit != null && used > targetLimit;
    return { metric, used, targetLimit, blocked };
  });
}

/** Narrative for org billing docs — workspace-scoped entitlements today. */
export function describeEntitlementScope(): string {
  return "Workspace billing maps to the authenticated owner subscription. Organization-level Stripe contracts are manual / roadmap — see docs/ORGANIZATION_BILLING_MODEL.md.";
}
