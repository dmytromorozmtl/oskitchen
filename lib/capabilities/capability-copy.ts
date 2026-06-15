import type { CapabilityStatus } from "./capability-status";

export function capabilityStatusLabel(s: CapabilityStatus): string {
  switch (s) {
    case "LIVE":
      return "Live";
    case "BETA":
      return "Beta";
    case "SETUP_READY":
      return "Setup-ready";
    case "PARTNER_ACCESS_REQUIRED":
      return "Partner access required";
    case "PARTIAL":
      return "Partial";
    case "DEV_ONLY":
      return "Dev / internal";
    case "DESIGN_READY":
      return "Design-ready";
    case "ROADMAP":
      return "Roadmap";
    case "NOT_AVAILABLE":
      return "Not available";
    default:
      return s;
  }
}

export function capabilityStatusFootnote(): string {
  return "Statuses are engineering-sourced — not a legal warranty. Marketplace, payments, and hardware features require your configuration, partner contracts, and operational verification.";
}
