/**
 * U5 — Multi-agent experiment orchestrator: Planner → Critic → Executor over T5 discovery + S5 scientist.
 */

import { randomBytes } from "node:crypto";
import { hashAutoConcludeApprovalToken } from "@/lib/storefront/theme-experiment-auto-conclude-approval";
import { readAutonomousScientist } from "@/lib/storefront/theme-experiment-autonomous-scientist";
import {
  approveCausalDiscoveryCycle,
  readCausalDiscoveryAgent,
} from "@/lib/storefront/theme-experiment-causal-discovery-agent";
import { runCausalDiscoveryClosedLoop } from "@/lib/storefront/theme-experiment-causal-discovery-agent";
import { readSpilloverDaily } from "@/lib/storefront/theme-experiment-causal-dag";

export type OrchestratorAgentRole = "planner" | "critic" | "executor";

export type OrchestratorPlan = {
  at: string;
  planId: string;
  action: "run_discovery" | "promote_scientist" | "request_publish" | "noop";
  rationale: string;
  riskScore: number;
};

export type OrchestratorVerdict = {
  at: string;
  planId: string;
  approved: boolean;
  criticNotes: string;
  requireSlackApproval: boolean;
};

export type OrchestratorExecution = {
  at: string;
  planId: string;
  status: "executed" | "skipped" | "pending_slack";
  detail: string;
};

export type MultiAgentOrchestratorSnapshot = {
  at: string;
  plans: OrchestratorPlan[];
  verdicts: OrchestratorVerdict[];
  executions: OrchestratorExecution[];
  slackApprovalTokenHash: string | null;
  pendingSlack: boolean;
};

export function isMultiAgentOrchestratorEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_MULTI_AGENT_ORCHESTRATOR === "1";
}

export function orchestratorSlackRiskThreshold(): number {
  return Number(process.env.THEME_EXPERIMENT_ORCHESTRATOR_SLACK_RISK ?? "0.6");
}

export function readMultiAgentOrchestrator(raw: unknown): MultiAgentOrchestratorSnapshot | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).multiAgentOrchestrator;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const s = o as Record<string, unknown>;
  return {
    at: typeof s.at === "string" ? s.at : new Date().toISOString(),
    plans: Array.isArray(s.plans) ? (s.plans as OrchestratorPlan[]) : [],
    verdicts: Array.isArray(s.verdicts) ? (s.verdicts as OrchestratorVerdict[]) : [],
    executions: Array.isArray(s.executions) ? (s.executions as OrchestratorExecution[]) : [],
    slackApprovalTokenHash:
      typeof s.slackApprovalTokenHash === "string" ? s.slackApprovalTokenHash : null,
    pendingSlack: s.pendingSlack === true,
  };
}

export function mergeMultiAgentOrchestrator(
  previousRaw: unknown,
  snap: MultiAgentOrchestratorSnapshot,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.multiAgentOrchestrator = snap;
  return base;
}

function plannerAgent(raw: unknown): OrchestratorPlan {
  const discovery = readCausalDiscoveryAgent(raw);
  const scientist = readAutonomousScientist(raw);
  const spill = readSpilloverDaily(raw);

  let action: OrchestratorPlan["action"] = "noop";
  let rationale = "No actionable experiment state.";
  let riskScore = 0.1;

  if (discovery?.pendingApproval) {
    action = "run_discovery";
    rationale = "Causal discovery awaiting holdout push after high spillover.";
    riskScore = 0.75;
  } else if (spill?.cells.length && (spill.maxSpilloverPp ?? 0) > 1) {
    action = "run_discovery";
    rationale = `Refresh DAG/interference from spillover max ${spill.maxSpilloverPp}pp.`;
    riskScore = 0.55;
  } else if (scientist?.proposals.some((p) => p.status === "proposed" && p.riskTier === "low")) {
    action = "promote_scientist";
    rationale = "Low-risk scientist proposal ready for execution.";
    riskScore = 0.35;
  } else if (scientist?.proposals.some((p) => p.status === "running")) {
    action = "request_publish";
    rationale = "Scientist run complete — evaluate publish gates.";
    riskScore = 0.5;
  }

  return {
    at: new Date().toISOString(),
    planId: `plan-${Date.now()}`,
    action,
    rationale,
    riskScore,
  };
}

function criticAgent(plan: OrchestratorPlan): OrchestratorVerdict {
  const threshold = orchestratorSlackRiskThreshold();
  const requireSlackApproval = plan.riskScore >= threshold || plan.action === "request_publish";
  const approved = plan.action === "noop" ? true : plan.riskScore < 0.9;

  return {
    at: new Date().toISOString(),
    planId: plan.planId,
    approved,
    criticNotes: approved
      ? requireSlackApproval
        ? "Approved with Slack human gate."
        : "Auto-approved within risk budget."
      : "Rejected — risk too high for autonomous execution.",
    requireSlackApproval: approved && requireSlackApproval,
  };
}

function executorAgent(
  previousRaw: unknown,
  plan: OrchestratorPlan,
  verdict: OrchestratorVerdict,
): { json: Record<string, unknown>; execution: OrchestratorExecution; token?: string } {
  if (!verdict.approved || plan.action === "noop") {
    return {
      json:
        previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
          ? { ...(previousRaw as Record<string, unknown>) }
          : {},
      execution: {
        at: new Date().toISOString(),
        planId: plan.planId,
        status: "skipped",
        detail: verdict.criticNotes,
      },
    };
  }

  if (verdict.requireSlackApproval) {
    const token = randomBytes(24).toString("hex");
    const base =
      previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
        ? { ...(previousRaw as Record<string, unknown>) }
        : {};
    const prev = readMultiAgentOrchestrator(previousRaw) ?? {
      at: new Date().toISOString(),
      plans: [],
      verdicts: [],
      executions: [],
      slackApprovalTokenHash: null,
      pendingSlack: false,
    };
    const snap: MultiAgentOrchestratorSnapshot = {
      ...prev,
      at: new Date().toISOString(),
      slackApprovalTokenHash: hashAutoConcludeApprovalToken(token),
      pendingSlack: true,
    };
    return {
      json: mergeMultiAgentOrchestrator(base, snap),
      execution: {
        at: new Date().toISOString(),
        planId: plan.planId,
        status: "pending_slack",
        detail: "Awaiting Slack approval for orchestrator plan.",
      },
      token,
    };
  }

  let json =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};

  if (plan.action === "run_discovery") {
    const spill = readSpilloverDaily(json);
    if (spill?.cells.length) {
      const loop = runCausalDiscoveryClosedLoop(json, spill.cells);
      json = loop.json;
    } else if (readCausalDiscoveryAgent(json)?.pendingApproval) {
      json = approveCausalDiscoveryCycle(json);
    }
  }

  return {
    json,
    execution: {
      at: new Date().toISOString(),
      planId: plan.planId,
      status: "executed",
      detail: `Executed ${plan.action}: ${plan.rationale}`,
    },
  };
}

/** Run one Planner → Critic → Executor cycle. */
export function runMultiAgentOrchestratorCycle(previousRaw: unknown): {
  json: Record<string, unknown>;
  snap: MultiAgentOrchestratorSnapshot;
  slackToken?: string;
} {
  const prev = readMultiAgentOrchestrator(previousRaw) ?? {
    at: new Date().toISOString(),
    plans: [],
    verdicts: [],
    executions: [],
    slackApprovalTokenHash: null,
    pendingSlack: false,
  };

  const plan = plannerAgent(previousRaw);
  const verdict = criticAgent(plan);
  const { json, execution, token } = executorAgent(previousRaw, plan, verdict);

  const snap: MultiAgentOrchestratorSnapshot = {
    at: new Date().toISOString(),
    plans: [...prev.plans, plan].slice(-30),
    verdicts: [...prev.verdicts, verdict].slice(-30),
    executions: [...prev.executions, execution].slice(-30),
    slackApprovalTokenHash: token
      ? hashAutoConcludeApprovalToken(token)
      : prev.slackApprovalTokenHash,
    pendingSlack: execution.status === "pending_slack" || prev.pendingSlack,
  };

  const merged = mergeMultiAgentOrchestrator(json, snap);
  return { json: merged, snap, slackToken: token };
}

export function clearOrchestratorSlackPending(raw: unknown): Record<string, unknown> {
  const prev = readMultiAgentOrchestrator(raw);
  if (!prev) {
    return raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  }
  return mergeMultiAgentOrchestrator(raw, {
    ...prev,
    pendingSlack: false,
    slackApprovalTokenHash: null,
    at: new Date().toISOString(),
  });
}

export function evaluateMultiAgentOrchestratorGate(raw: unknown): {
  passed: boolean;
  headline: string;
  detail: string;
} {
  if (!isMultiAgentOrchestratorEnabled()) {
    return { passed: true, headline: "Multi-agent orchestrator off", detail: "" };
  }
  const snap = readMultiAgentOrchestrator(raw);
  if (!snap) {
    return { passed: true, headline: "No orchestrator cycles", detail: "" };
  }
  if (snap.pendingSlack) {
    return {
      passed: false,
      headline: "Orchestrator awaiting Slack approval",
      detail: "Planner action requires human confirm before publish.",
    };
  }
  return {
    passed: true,
    headline: `Orchestrator OK (${snap.executions.length} executions)`,
    detail: `Latest plan: ${snap.plans[snap.plans.length - 1]?.action ?? "none"}`,
  };
}
