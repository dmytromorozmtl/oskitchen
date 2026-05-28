/**
 * Launch Wizard Today strip commercial cross-link — Evolution Era 19 Workstream B/C Cycle 20.
 */

import { LAUNCH_WIZARD_COMMERCIAL_SETUP_ERA19_POLICY_ID } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_TODAY_STRIP_ERA19_POLICY_ID =
  "era19-launch-wizard-today-strip-v1" as const;

export const LAUNCH_WIZARD_TODAY_STRIP_ERA19_EXTENDS_POLICIES = [
  LAUNCH_WIZARD_COMMERCIAL_SETUP_ERA19_POLICY_ID,
] as const;

export const LAUNCH_WIZARD_TODAY_STRIP_ERA19_BACKLOG_ID = "KOS-E19-020" as const;
