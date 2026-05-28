import {
  GETTING_STARTED_SSO_PILOT_ACTIVATION_ANCHOR,
  GETTING_STARTED_SSO_PILOT_CONFIGURATION_ANCHOR,
  GETTING_STARTED_SSO_PILOT_SETTINGS_ROUTE,
} from "@/lib/onboarding/getting-started-pilot-sso-era18-policy";
import type { GettingStartedPayload } from "@/services/onboarding/getting-started-status";

export type GettingStartedPilotSsoFocus = {
  entitlementEnabled: boolean;
  configured: boolean;
  active: boolean;
  workspaceId: string | null;
  ssoSetupIncomplete: boolean;
};

export type GettingStartedPilotSsoAttentionItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  priority: number;
  tone: "urgent" | "normal";
};

export function buildGettingStartedPilotSsoFocus(
  payload: GettingStartedPayload,
): GettingStartedPilotSsoFocus {
  const pilotSso = payload.pilotSso;

  return {
    entitlementEnabled: pilotSso.entitlementEnabled,
    configured: pilotSso.configured,
    active: pilotSso.active,
    workspaceId: pilotSso.workspaceId,
    ssoSetupIncomplete: pilotSso.entitlementEnabled && !pilotSso.active,
  };
}

export function summarizeGettingStartedPilotSsoFocus(
  focus: GettingStartedPilotSsoFocus,
): { totalSignals: number; hasUrgent: boolean } {
  if (!focus.ssoSetupIncomplete) {
    return { totalSignals: 0, hasUrgent: false };
  }

  return {
    totalSignals: 1,
    hasUrgent: !focus.configured || !focus.active,
  };
}

/** Enterprise pilot onboarding — SSO setup before scaling staff access. */
export function pickGettingStartedPilotSsoAttentionItems(
  focus: GettingStartedPilotSsoFocus,
): GettingStartedPilotSsoAttentionItem[] {
  if (!focus.ssoSetupIncomplete) return [];

  const items: GettingStartedPilotSsoAttentionItem[] = [];

  if (!focus.configured) {
    items.push({
      id: "configure-sso-pilot",
      title: "Configure enterprise SSO pilot",
      detail:
        "Your plan includes SSO — save IdP settings before staff sign-in. Not production SSO for all tenants.",
      href: `${GETTING_STARTED_SSO_PILOT_SETTINGS_ROUTE}${GETTING_STARTED_SSO_PILOT_CONFIGURATION_ANCHOR}`,
      priority: 1,
      tone: "urgent",
    });
    return items;
  }

  if (!focus.active) {
    items.push({
      id: "activate-sso-pilot",
      title: "Activate SSO pilot for this workspace",
      detail: "Pilot IdP is configured but inactive — activate before staff use Sign in with SSO.",
      href: `${GETTING_STARTED_SSO_PILOT_SETTINGS_ROUTE}${GETTING_STARTED_SSO_PILOT_ACTIVATION_ANCHOR}`,
      priority: 2,
      tone: "urgent",
    });
    return items;
  }

  return items;
}
