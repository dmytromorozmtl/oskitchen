import type { WorkspaceSsoAdminView } from "@/lib/enterprise/workspace-sso-admin-service";

export type SsoPilotSetupStepId =
  | "sso_entitlement"
  | "configure_idp"
  | "activate_pilot"
  | "idp_login_proof";

export type SsoPilotSetupStepDef = {
  id: SsoPilotSetupStepId;
  title: string;
  description: string;
};

export type SsoPilotSetupStepStatus = {
  id: SsoPilotSetupStepId;
  complete: boolean;
  isCurrent: boolean;
};

export type SsoPilotSetupProgress = {
  steps: SsoPilotSetupStepStatus[];
  completedCount: number;
  totalCount: number;
  currentStepId: SsoPilotSetupStepId | null;
  adminSetupComplete: boolean;
};

export const SSO_PILOT_SETUP_STEPS: readonly SsoPilotSetupStepDef[] = [
  {
    id: "sso_entitlement",
    title: "Enable SSO entitlement",
    description:
      "Workspace owner needs the `ssoOidc` entitlement before pilot IdP configuration.",
  },
  {
    id: "configure_idp",
    title: "Configure pilot IdP",
    description:
      "Save Supabase SAML provider reference, allowed email domains, and IdP vendor for the pilot tenant.",
  },
  {
    id: "activate_pilot",
    title: "Activate SSO pilot",
    description: "Turn on pilot SSO for this workspace so staff can use Sign in with SSO on /login.",
  },
  {
    id: "idp_login_proof",
    title: "Complete IdP login proof (staging ops)",
    description:
      "Operator completes one successful IdP login on staging and records proof via smoke scripts — product UI does not auto-pass this step.",
  },
] as const;

const STEP_ORDER: readonly SsoPilotSetupStepId[] = [
  "sso_entitlement",
  "configure_idp",
  "activate_pilot",
  "idp_login_proof",
];

function isStepComplete(stepId: SsoPilotSetupStepId, view: WorkspaceSsoAdminView): boolean {
  switch (stepId) {
    case "sso_entitlement":
      return view.ssoEntitlementEnabled;
    case "configure_idp":
      return view.configured;
    case "activate_pilot":
      return view.active;
    case "idp_login_proof":
      // Honest — only ops artifact can pass; never auto-complete in admin UI.
      return false;
    default:
      return false;
  }
}

export function evaluateSsoPilotSetupProgress(view: WorkspaceSsoAdminView): SsoPilotSetupProgress {
  const steps: SsoPilotSetupStepStatus[] = STEP_ORDER.map((id) => ({
    id,
    complete: isStepComplete(id, view),
    isCurrent: false,
  }));

  const currentStepId =
    STEP_ORDER.find((id) => !isStepComplete(id, view)) ?? null;

  if (currentStepId) {
    const current = steps.find((step) => step.id === currentStepId);
    if (current) current.isCurrent = true;
  }

  const completedCount = steps.filter((step) => step.complete).length;
  const adminSetupComplete =
    view.ssoEntitlementEnabled && view.configured && view.active;

  return {
    steps,
    completedCount,
    totalCount: STEP_ORDER.length,
    currentStepId,
    adminSetupComplete,
  };
}
