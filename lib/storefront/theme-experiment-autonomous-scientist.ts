import { toJsonValue } from "@/lib/prisma/json";
/**
 * S5 — Autonomous experiment scientist: LLM propose → run → conclude with human approval gate.
 */

export type ScientistProposal = {
  at: string;
  proposalId: string;
  hypothesis: string;
  variantSummary: string;
  expectedLiftPp: number;
  riskTier: "low" | "medium" | "high";
  status: "proposed" | "running" | "concluded" | "rejected";
};

export type ScientistGuardrails = {
  maxConcurrentRuns: number;
  minSampleSize: number;
  requireHumanApproval: boolean;
  blockedRiskTiers: ("high" | "medium" | "low")[];
};

export type AutonomousScientistSnapshot = {
  at: string;
  proposals: ScientistProposal[];
  guardrails: ScientistGuardrails;
  approvalTokenHash: string | null;
  lastConcludeAt: string | null;
};

export function isAutonomousScientistEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_AUTONOMOUS_SCIENTIST === "1";
}

export function readAutonomousScientist(raw: unknown): AutonomousScientistSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).autonomousScientist;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  const guardrails = s.guardrails as ScientistGuardrails | undefined;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    proposals: Array.isArray(s.proposals) ? (s.proposals as ScientistProposal[]) : [],
    guardrails: guardrails ?? defaultGuardrails(),
    approvalTokenHash: typeof s.approvalTokenHash === "string" ? s.approvalTokenHash : null,
    lastConcludeAt: typeof s.lastConcludeAt === "string" ? s.lastConcludeAt : null,
  };
}

export function defaultGuardrails(): ScientistGuardrails {
  return {
    maxConcurrentRuns: Number(process.env.THEME_EXPERIMENT_SCIENTIST_MAX_RUNS ?? "2"),
    minSampleSize: Number(process.env.THEME_EXPERIMENT_SCIENTIST_MIN_SAMPLE ?? "200"),
    requireHumanApproval: process.env.THEME_EXPERIMENT_SCIENTIST_AUTO_APPROVE !== "1",
    blockedRiskTiers: ["high"],
  };
}

export function mergeScientistIntoJson(
  previousRaw: unknown,
  snap: AutonomousScientistSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.autonomousScientist = snap;
  return base;
}

export function ingestScientistProposal(
  raw: unknown,
  proposal: Omit<ScientistProposal, "at" | "proposalId" | "status"> & {
    proposalId?: string;
  },
): AutonomousScientistSnapshot {
  const prev = readAutonomousScientist(raw) ?? {
    at: new Date().toISOString(),
    proposals: [],
    guardrails: defaultGuardrails(),
    approvalTokenHash: null,
    lastConcludeAt: null,
  };

  if (prev.guardrails.blockedRiskTiers.includes(proposal.riskTier)) {
    return prev;
  }

  const running = prev.proposals.filter((p) => p.status === "running").length;
  if (running >= prev.guardrails.maxConcurrentRuns) {
    return prev;
  }

  const entry: ScientistProposal = {
    at: new Date().toISOString(),
    proposalId: proposal.proposalId ?? `sci-${Date.now()}`,
    hypothesis: proposal.hypothesis,
    variantSummary: proposal.variantSummary,
    expectedLiftPp: proposal.expectedLiftPp,
    riskTier: proposal.riskTier,
    status: "proposed",
  };

  return {
    ...prev,
    at: new Date().toISOString(),
    proposals: [...prev.proposals, entry].slice(-50),
  };
}

export function markProposalRunning(
  snap: AutonomousScientistSnapshot,
  proposalId: string,
): AutonomousScientistSnapshot {
  return {
    ...snap,
    proposals: snap.proposals.map((p) =>
      p.proposalId === proposalId ? { ...p, status: "running" as const } : p,
    ),
  };
}

export function evaluateAutonomousScientistGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isAutonomousScientistEnabled()) {
    return { passed: true, headline: "Autonomous scientist off", detail: "" };
  }
  const snap = readAutonomousScientist(raw);
  if (!snap) {
    return { passed: true, headline: "No scientist state", detail: "" };
  }
  const pendingHigh = snap.proposals.some(
    (p) => p.status === "proposed" && p.riskTier === "high",
  );
  if (pendingHigh) {
    return {
      passed: false,
      headline: "High-risk proposal pending approval",
      detail: "Human must approve or reject before publish.",
    };
  }
  const running = snap.proposals.filter((p) => p.status === "running").length;
  if (running > snap.guardrails.maxConcurrentRuns) {
    return {
      passed: false,
      headline: "Too many scientist runs",
      detail: `Max ${snap.guardrails.maxConcurrentRuns} concurrent.`,
    };
  }
  return {
    passed: true,
    headline: `Scientist OK (${running} running)`,
    detail: snap.guardrails.requireHumanApproval
      ? "Human approval required for conclude."
      : "Auto-approve enabled.",
  };
}
