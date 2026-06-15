/**
 * KDS v1 certified rollout gate (see docs/kds-v1-scope.md).
 * Production daily-service tenants use the v1 ticket UI by default.
 * Non-production environments require ENABLE_KDS_V1_CERTIFIED=true.
 */
export function isKdsV1CertifiedRolloutEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return true;
  return process.env.ENABLE_KDS_V1_CERTIFIED === "true";
}
