/**
 * Pilot / production Tier A: theme & compliance experiments off unless explicitly enabled.
 * Set STOREFRONT_EXPERIMENTS_ENABLED=1 only on staging game-day or advanced QA.
 */
export function isStorefrontExperimentsEnabled(): boolean {
  return process.env.STOREFRONT_EXPERIMENTS_ENABLED === "1";
}

/** Server-authoritative guest cart (signed cookie). On by default for pilot. */
export function isStorefrontServerCartEnabled(): boolean {
  if (process.env.STOREFRONT_SERVER_CART === "0") return false;
  return true;
}
