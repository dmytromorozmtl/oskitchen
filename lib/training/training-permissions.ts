import { isSuperAdminEmail } from "@/lib/platform-owner";

export type TrainingActorScope = {
  isOwner: boolean;
  role?: string | null;
  email?: string | null;
};

export type TrainingCapability =
  | "training.view"
  | "training.program.create"
  | "training.program.edit"
  | "training.assign"
  | "training.progress.write"
  | "training.quiz.attempt"
  | "training.cert.issue"
  | "training.cert.revoke"
  | "training.sim.run"
  | "training.sop.create"
  | "training.sop.publish"
  | "training.sop.acknowledge"
  | "training.audit";

const GRANTS: Record<TrainingCapability, string[]> = {
  "training.view": [
    "trainee", "trainer", "supervisor", "manager", "kitchen", "kitchen_lead",
    "packer", "packing", "driver", "dispatcher", "operations_lead", "admin",
    "implementation_manager", "support_admin", "viewer", "staff",
  ],
  "training.program.create": ["admin", "manager", "trainer", "operations_lead", "implementation_manager"],
  "training.program.edit": ["admin", "manager", "trainer", "operations_lead", "implementation_manager"],
  "training.assign": ["admin", "manager", "supervisor", "trainer", "operations_lead", "implementation_manager"],
  "training.progress.write": [
    "trainee", "trainer", "supervisor", "manager", "kitchen_lead", "operations_lead", "admin", "staff",
  ],
  "training.quiz.attempt": [
    "trainee", "trainer", "supervisor", "manager", "kitchen_lead", "operations_lead", "admin", "staff",
  ],
  "training.cert.issue": ["admin", "manager", "supervisor", "trainer", "operations_lead"],
  "training.cert.revoke": ["admin", "manager", "operations_lead"],
  "training.sim.run": [
    "trainee", "trainer", "supervisor", "manager", "kitchen_lead", "operations_lead", "admin", "staff",
  ],
  "training.sop.create": ["admin", "manager", "trainer", "operations_lead"],
  "training.sop.publish": ["admin", "manager", "operations_lead"],
  "training.sop.acknowledge": [
    "trainee", "trainer", "supervisor", "manager", "kitchen_lead", "operations_lead", "admin", "staff",
  ],
  "training.audit": ["admin", "manager", "operations_lead", "accountant"],
};

export function isSuperAdminTraining(scope: TrainingActorScope): boolean {
  return isSuperAdminEmail(scope.email);
}

export function canUseTraining(scope: TrainingActorScope, cap: TrainingCapability): boolean {
  if (isSuperAdminTraining(scope)) return true;
  if (scope.isOwner) return true;
  const role = (scope.role ?? "").toLowerCase();
  return GRANTS[cap]?.includes(role) ?? false;
}
