import type { PermissionKey } from "@/lib/permissions/permissions";
import type { TrainingCapability } from "@/lib/training/training-permissions";

const PARTICIPANT_CAPABILITIES = new Set<TrainingCapability>([
  "training.progress.write",
  "training.quiz.attempt",
  "training.sim.run",
  "training.sop.acknowledge",
]);

/** Map a training capability to the canonical workspace permission for server gates. */
export function workspacePermissionForTrainingCapability(
  capability: TrainingCapability,
): PermissionKey {
  if (PARTICIPANT_CAPABILITIES.has(capability)) {
    return "training.participate";
  }
  return "training.manage";
}
