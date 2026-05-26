import { PROGRAM_STEPS } from "@/lib/beta-ops/program-catalog";
import type { ProgramState, ProgramStepId } from "@/lib/beta-ops/program-state";
import { checkEnvForStep } from "@/lib/beta-ops/env-requirements";
import { guardStep } from "@/lib/beta-ops/step-guards";

export type NextAction = {
  step: ProgramStepId | null;
  title: string;
  command: string;
  reason: string;
  blockedBy?: string;
};

export function resolveNextAction(state: ProgramState): NextAction {
  for (const meta of PROGRAM_STEPS) {
    const rec = state.steps[String(meta.id)];
    if (rec?.ok === true) continue;

    const env = checkEnvForStep(meta.id);
    const cmd = meta.commands[0] ?? `npm run beta:program -- --step=${meta.id}`;

    if (!env.ok) {
      return {
        step: meta.id,
        title: meta.title,
        command: `npm run beta:env-check -- --step=${meta.id} --validate`,
        reason: `Missing env: ${env.missing.join(", ")}`,
        blockedBy: "env",
      };
    }

    const guard = guardStep(meta.id, state);
    if (!guard.ok) {
      return {
        step: meta.id,
        title: meta.title,
        command: `npm run beta:preflight -- --step=${meta.id}`,
        reason: guard.blockers.join("; "),
        blockedBy: "prerequisite",
      };
    }

    if (meta.id === 0 && guard.warnings.some((w) => w.includes("STAGING_PREP"))) {
      return {
        step: meta.id,
        title: meta.title,
        command: "npm run beta:staging-prep",
        reason: "Staging prep not recorded — run on staging host first",
        blockedBy: "staging",
      };
    }

    if (rec?.ok === false) {
      return {
        step: meta.id,
        title: meta.title,
        command: cmd,
        reason: "Previous run failed — retry after fixing artifacts",
      };
    }

    return {
      step: meta.id,
      title: meta.title,
      command: cmd,
      reason: rec ? "In progress or not verified" : "Not started",
    };
  }

  return {
    step: null,
    title: "Program complete",
    command: "npm run beta:go-no-go -- --record-decision=go",
    reason: "All steps 0–5 marked OK — expand cohort or start POST_BETA_EPIC",
  };
}
