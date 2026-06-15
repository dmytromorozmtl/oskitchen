import type { SupportLevel } from "@/lib/channels/channel-types";

export function supportLevelBadgeLabel(level: SupportLevel): string {
  switch (level) {
    case "LIVE_READY":
      return "Live ready";
    case "BUILDABLE_WITH_CREDENTIALS":
      return "Credentials required";
    case "PARTNER_REQUIRED":
      return "Partner required";
    case "COMING_SOON":
      return "Coming soon";
    case "DEMO_ONLY":
      return "Demo / manual only";
    case "MANUAL_ONLY":
      return "Manual";
    default:
      return level;
  }
}

export function supportLevelShortHint(level: SupportLevel): string {
  switch (level) {
    case "LIVE_READY":
      return "Works today in OS Kitchen without third-party approval.";
    case "BUILDABLE_WITH_CREDENTIALS":
      return "Production-ready path once encrypted credentials and webhooks are configured.";
    case "PARTNER_REQUIRED":
      return "Requires partner-issued credentials; OS Kitchen does not claim official marketplace certification.";
    case "COMING_SOON":
      return "Roadmap placeholder — no live connector shipped.";
    case "DEMO_ONLY":
      return "Experimental or manual workflow; not a streaming integration.";
    case "MANUAL_ONLY":
      return "Staff-created orders inside OS Kitchen.";
    default:
      return "";
  }
}
