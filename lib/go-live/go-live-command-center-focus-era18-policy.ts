/**
 * Go-live command center focus — Evolution Era 18 Workstream P Cycle 60.
 *
 * Progress ring + collapsed secondary signals when next-step hero is active.
 * Does not claim launch certification PASS or live smoke PASS.
 */

import { GO_LIVE_PROJECT_NEXT_STEP_ERA18_POLICY_ID } from "@/lib/go-live/go-live-project-next-step-focus-era18-policy";

export const GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_POLICY_ID =
  "era18-go-live-command-center-focus-v1" as const;

export const GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_EXTENDS_POLICIES = [
  GO_LIVE_PROJECT_NEXT_STEP_ERA18_POLICY_ID,
] as const;

export const GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_PROOF_STATUS =
  "go_live_command_center_progress_collapse_wired" as const;

export const GO_LIVE_COMMAND_CENTER_FOCUS_ERA18_BACKLOG_ID = "KOS-E18-060" as const;

export const GO_LIVE_SECONDARY_SIGNALS_ANCHOR = "#go-live-secondary-signals" as const;
