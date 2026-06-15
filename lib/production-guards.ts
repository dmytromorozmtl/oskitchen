import { isDemoGloballyFlagged } from "@/lib/env";

/** True when Node runtime is production (not preview-specific). */
export function isNodeProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Demo import/reset mutates workspace data — disallow on production hosts unless an
 * operator explicitly enables supervised demo via DEMO_MODE_ENABLED.
 */
export function areDemoWorkspaceMutationsAllowed(): boolean {
  if (!isNodeProduction()) return true;
  return isDemoGloballyFlagged();
}

export function demoWorkspaceBlockedInProductionMessage(): string {
  return "Demo workspace import and reset are disabled in production. Enable DEMO_MODE_ENABLED for supervised beta demos, or use staging.";
}
