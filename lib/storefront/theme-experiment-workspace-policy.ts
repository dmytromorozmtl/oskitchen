import { prisma } from "@/lib/prisma";
export const WORKSPACE_EXPERIMENT_POLICY_FEATURE_KEY = "storefront.experiment.policy";

export type WorkspaceExperimentPolicy = {
  autoConcludeDefault?: boolean;
  requireApproval?: boolean;
  minLiftPp?: number;
};

export function parseWorkspaceExperimentPolicy(raw: unknown): WorkspaceExperimentPolicy {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  return {
    autoConcludeDefault: o.autoConcludeDefault === true,
    requireApproval: o.requireApproval !== false,
    minLiftPp: typeof o.minLiftPp === "number" ? o.minLiftPp : undefined,
  };
}

export async function readWorkspaceExperimentPolicy(
  workspaceId: string | null | undefined,
): Promise<WorkspaceExperimentPolicy> {
  if (!workspaceId?.trim()) return {};
  const row = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { experimentPolicyJson: true },
  });
  return parseWorkspaceExperimentPolicy(row?.experimentPolicyJson);
}

export function resolveAutoConcludeRequireApproval(input: {
  workspacePolicy: WorkspaceExperimentPolicy;
  storeAutoConcludeEnabled: boolean;
}): boolean {
  if (process.env.THEME_EXPERIMENT_AUTO_CONCLUDE_SKIP_APPROVAL === "1") return false;
  if (input.workspacePolicy.requireApproval === false) return false;
  return input.storeAutoConcludeEnabled;
}

export function resolveMinLiftPp(workspacePolicy: WorkspaceExperimentPolicy, fallback = 2): number {
  return typeof workspacePolicy.minLiftPp === "number" ? workspacePolicy.minLiftPp : fallback;
}
