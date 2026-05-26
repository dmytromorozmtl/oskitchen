/**
 * Product-facing integration maturity — orthogonal to internal `IntegrationStatus`
 * and channel `ChannelStatusType`. Use for honesty in UI + docs.
 */
export type IntegrationMaturityTier =
  | "LIVE"
  | "BETA"
  | "SETUP_READY"
  | "PARTNER_ACCESS_REQUIRED"
  | "PARTIAL"
  | "DEV_ONLY"
  | "ROADMAP"
  | "NOT_AVAILABLE";
