import type { GoLiveLaunchStage } from "@prisma/client";

import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";
import {
  GO_LIVE_SSO_PILOT_ACTIVATION_ANCHOR,
  GO_LIVE_SSO_PILOT_BLOCKER_KEY,
  GO_LIVE_SSO_PILOT_CONFIGURATION_ANCHOR,
  GO_LIVE_SSO_PILOT_SETTINGS_ROUTE,
} from "@/lib/go-live/go-live-sso-pilot-focus-era18-policy";

export type GoLiveSsoPilotReadinessSlice = {
  ssoOidcEntitlementEnabled?: boolean;
  ssoPilotConfigured?: boolean;
  ssoPilotActive?: boolean;
};

export function goLiveSsoPilotActionRoute(configured: boolean): string {
  return configured
    ? `${GO_LIVE_SSO_PILOT_SETTINGS_ROUTE}${GO_LIVE_SSO_PILOT_ACTIVATION_ANCHOR}`
    : `${GO_LIVE_SSO_PILOT_SETTINGS_ROUTE}${GO_LIVE_SSO_PILOT_CONFIGURATION_ANCHOR}`;
}

/** HIGH_RISK launch blocker when entitled workspace has not activated SSO pilot. */
export function detectGoLiveSsoPilotBlocker(
  inputs: GoLiveSsoPilotReadinessSlice,
): LaunchBlocker | null {
  if (!inputs.ssoOidcEntitlementEnabled || inputs.ssoPilotActive) {
    return null;
  }

  const configured = inputs.ssoPilotConfigured ?? false;
  const stage: GoLiveLaunchStage = "STAFF_TRAINING";

  return {
    key: GO_LIVE_SSO_PILOT_BLOCKER_KEY,
    severity: "HIGH_RISK",
    stage,
    title: configured ? "Enterprise SSO pilot not activated" : "Enterprise SSO pilot not configured",
    impact:
      "Staff cannot use Sign in with SSO until the pilot is active. Staging IdP login proof remains a separate ops step — not auto-passed at launch.",
    resolution: configured
      ? "Activate the SSO pilot for this workspace before enterprise staff rollout."
      : "Complete the SSO pilot wizard — save IdP settings, then activate for this workspace.",
    actionRoute: goLiveSsoPilotActionRoute(configured),
  };
}

export function resolveGoLiveSsoPilotBlockerRowNextAction(blocker: LaunchBlocker): {
  label: string;
  href: string;
  tone: "urgent" | "normal";
} | null {
  if (blocker.key !== GO_LIVE_SSO_PILOT_BLOCKER_KEY || !blocker.actionRoute) {
    return null;
  }

  const activating = blocker.actionRoute.includes(GO_LIVE_SSO_PILOT_ACTIVATION_ANCHOR.slice(1));

  return {
    label: activating ? "Activate SSO pilot" : "Open SSO pilot wizard",
    href: blocker.actionRoute,
    tone: "urgent",
  };
}
