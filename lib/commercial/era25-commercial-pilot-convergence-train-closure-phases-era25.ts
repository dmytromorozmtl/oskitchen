/**
 * era25 Commercial pilot convergence train closure — final rollup of era47–era54 integrity baselines.
 * Policy: era25-commercial-pilot-convergence-train-closure-phases-v1
 */
export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_PHASES_POLICY_ID =
  "era25-commercial-pilot-convergence-train-closure-phases-v1" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_DOC =
  "docs/next-step-era25-commercial-pilot-convergence-train-closure-phase-ae-product-2026-05-28.md" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_PLATFORM_ANCHOR =
  "#era25-commercial-pilot-convergence-train-closure" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_TRACKED_ENV_KEYS = [
  "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ATTESTED",
  "ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_REPORT_REVIEWED",
] as const;

export function detectEra25CommercialPilotConvergenceTrainClosureStarted(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_TRACKED_ENV_KEYS.some((key) =>
    Boolean(env[key]?.trim()),
  );
}

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_BACKLOG_ID =
  "KOS-E25-010-TRAIN-CLOSURE" as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_GUARDRAILS: readonly string[] = [
  "Never attest train closure before pure_operational_mode_era25_active",
  "Never attest train closure without all era47–era54 convergence integrity baselines on disk",
  "Never hand-edit PASS in artifacts/*.json",
  "Never skip test:ci:commercial-pilot-runbook:cert after train closure",
  "Never re-enable era25 convergence surfaces after honest pure ops terminus",
] as const;

export const ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_FOREVER_COMMANDS: readonly string[] =
  [
    "ops:validate-era25-commercial-pilot-convergence-train-closure-integrity",
    "ops:validate-pure-operational-mode-terminus-convergence-integrity",
    "ops:validate-sustained-operational-excellence-convergence-integrity",
    "test:ci:commercial-pilot-runbook:cert",
  ] as const;
