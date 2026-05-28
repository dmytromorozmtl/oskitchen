/**
 * Go-live project next-step hero — Evolution Era 18 Workstream P Cycle 59.
 *
 * Single prioritized launch action for operators on go-live project surfaces.
 * Does not claim launch certification PASS or live smoke PASS.
 */

import { GO_LIVE_PILOT_READINESS_FOCUS_ERA18_POLICY_ID } from "@/lib/go-live/go-live-pilot-readiness-focus-era18-policy";

export const GO_LIVE_PROJECT_NEXT_STEP_ERA18_POLICY_ID = "era18-go-live-project-next-step-v1" as const;

export const GO_LIVE_PROJECT_NEXT_STEP_ERA18_EXTENDS_POLICIES = [
  GO_LIVE_PILOT_READINESS_FOCUS_ERA18_POLICY_ID,
  "era18-go-live-focus-v1",
  "era18-go-live-checklist-focus-v1",
] as const;

export const GO_LIVE_PROJECT_NEXT_STEP_ERA18_PROOF_STATUS = "go_live_project_next_step_hero_wired" as const;

export const GO_LIVE_PROJECT_NEXT_STEP_ERA18_BACKLOG_ID = "KOS-E18-059" as const;

export const GO_LIVE_APPROVALS_ANCHOR = "#go-live-approvals" as const;

export const GO_LIVE_VALIDATION_ANCHOR = "#go-live-validation" as const;
