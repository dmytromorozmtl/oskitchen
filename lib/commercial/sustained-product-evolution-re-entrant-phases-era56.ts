/**
 * Sustained product evolution re-entrant — post-train-closure product growth via improvement loop only.
 * Policy: era56-sustained-product-evolution-re-entrant-phases-v1
 */
export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA56_PHASES_POLICY_ID =
  "era56-sustained-product-evolution-re-entrant-phases-v1" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_DOC =
  "docs/next-step-sustained-product-evolution-re-entrant-phase-af-product-2026-05-28.md" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_PLATFORM_ANCHOR =
  "#sustained-product-evolution-re-entrant" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_TRACKED_ENV_KEYS = [
  "SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_ATTESTED",
  "SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ERA25_REPORT_REVIEWED",
] as const;

/** Era25 linear convergence attest keys — illegal to set after honest train closure. */
export const ERA25_LINEAR_CONVERGENCE_SURFACE_ENV_KEYS = [
  "OWNER_DAILY_BRIEFING_BREAKTHROUGH_ERA25_ATTESTED",
  "PAID_PILOT_GO_CONVERGENCE_ERA25_ATTESTED",
  "PILOT_WEEK1_EXECUTION_CONVERGENCE_ERA25_ATTESTED",
  "MONTH2_MARKET_READINESS_CONVERGENCE_ERA25_ATTESTED",
  "SCALE_READINESS_CONVERGENCE_ERA25_ATTESTED",
  "SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ERA25_ATTESTED",
  "MARKET_LEADER_POSITIONING_CONVERGENCE_ERA25_ATTESTED",
  "SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ERA25_ATTESTED",
] as const;

export function detectSustainedProductEvolutionReentrantStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export function detectEra25LinearConvergenceSurfaceReopened(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_LINEAR_CONVERGENCE_SURFACE_ENV_KEYS.some((key) => Boolean(env[key]?.trim()));
}

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_BACKLOG_ID =
  "KOS-E25-011-PRODUCT-EVOLUTION-REENTRANT" as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_GUARDRAILS: readonly string[] = [
  "Never attest re-entrant evolution before era25 commercial pilot convergence train closure is honest",
  "Never re-attest era25 linear convergence phase env keys after train closure",
  "Never skip improvement loop + sustained product evolution integrity before re-entrant attest",
  "Never skip test:ci:commercial-pilot-runbook:cert after re-entrant baseline sync",
  "Never surface era25 convergence Launch Wizard / briefing strips when pure operational mode is active",
] as const;

export const SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_FOREVER_COMMANDS: readonly string[] = [
  "ops:validate-sustained-product-evolution-re-entrant-integrity",
  "ops:validate-era25-commercial-pilot-convergence-train-closure-integrity",
  "ops:validate-sustained-product-evolution-integrity",
  "ops:validate-continuous-improvement-loop-integrity",
  "test:ci:commercial-pilot-runbook:cert",
] as const;
