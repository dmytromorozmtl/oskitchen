/**
 * Canonical capability / integration tier — same vocabulary as
 * {@link import("@/lib/integrations/integration-maturity-types").IntegrationMaturityTier}.
 */
export type CapabilityStatus =
  | "LIVE"
  | "BETA"
  | "SETUP_READY"
  | "PARTNER_ACCESS_REQUIRED"
  | "PARTIAL"
  | "DEV_ONLY"
  | "DESIGN_READY"
  | "ROADMAP"
  | "NOT_AVAILABLE";
