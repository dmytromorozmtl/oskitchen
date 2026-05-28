import { GO_LIVE_PILOT_READINESS_COMMAND_CENTER_ROUTE } from "@/lib/go-live/go-live-pilot-readiness-focus-era18-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const LAUNCH_WIZARD_FROM_GO_LIVE_ERA21_POLICY_ID =
  "era21-launch-wizard-from-go-live-v1" as const;

export const LAUNCH_WIZARD_FROM_GO_LIVE_QUERY = "from=go-live" as const;

export type LaunchWizardFromGoLiveBannerModel = {
  visible: boolean;
  headline: string;
  detail: string;
  advancedGoLiveHref: string;
  commercialBlockersHref: string;
  launchWizardHref: string;
};

export function resolveLaunchWizardFromGoLiveRedirect(
  fromParam: string | undefined,
): boolean {
  return fromParam === "go-live";
}

export function buildLaunchWizardFromGoLiveBannerModel(input: {
  fromGoLive: boolean;
}): LaunchWizardFromGoLiveBannerModel {
  const visible = input.fromGoLive;

  return {
    visible,
    headline: "Go-live is gated until commercial pilot evidence passes",
    detail:
      "Owners land here from Go-live until P0 staging proof, Tier 2 golden path, and GO/NO-GO artifact are honest PASS — not SKIPPED. Complete Launch Wizard setup and ops vault first.",
    advancedGoLiveHref: `${GO_LIVE_PILOT_READINESS_COMMAND_CENTER_ROUTE}?mode=advanced`,
    commercialBlockersHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    launchWizardHref: LAUNCH_WIZARD_ROUTE,
  };
}
