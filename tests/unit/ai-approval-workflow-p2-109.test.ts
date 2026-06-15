import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAiApprovalWorkflowP2_109,
  formatAiApprovalWorkflowP2_109AuditLines,
} from "@/lib/ai/ai-approval-workflow-p2-109-audit";
import { AI_APPROVAL_WORKFLOW_P2_109_STAGES } from "@/lib/ai/ai-approval-workflow-p2-109-content";
import {
  AI_APPROVAL_WORKFLOW_DEMO_AUDIT,
  AI_APPROVAL_WORKFLOW_DEMO_DRAFTS,
  buildApprovalWorkflowDemoReport,
  buildApprovalWorkflowStep,
  isStageComplete,
  validateApprovalTransition,
} from "@/lib/ai/ai-approval-workflow-p2-109-operations";
import {
  AI_APPROVAL_WORKFLOW_P2_109_CI_WORKFLOW,
  AI_APPROVAL_WORKFLOW_P2_109_DOC,
  AI_APPROVAL_WORKFLOW_P2_109_NPM_SCRIPT,
  AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID,
  AI_APPROVAL_WORKFLOW_P2_109_ROUTE,
  AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT,
  AI_APPROVAL_WORKFLOW_P2_109_UNIT_TEST,
} from "@/lib/ai/ai-approval-workflow-p2-109-policy";

const ROOT = process.cwd();

describe("AI approval workflow (P2-109)", () => {
  it("locks policy id, route, and four stages", () => {
    expect(AI_APPROVAL_WORKFLOW_P2_109_POLICY_ID).toBe("ai-approval-workflow-p2-109-v1");
    expect(AI_APPROVAL_WORKFLOW_P2_109_ROUTE).toBe("/dashboard/ai/approval-workflow");
    expect(AI_APPROVAL_WORKFLOW_P2_109_STAGE_COUNT).toBe(4);
    expect(AI_APPROVAL_WORKFLOW_P2_109_STAGES).toHaveLength(4);
  });

  it("passes full AI approval workflow audit", () => {
    const summary = auditAiApprovalWorkflowP2_109(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.legacyCopilotLinked).toBe(true);
    expect(summary.legacyCoPilotLinked).toBe(true);
    expect(summary.legacyActionsLinked).toBe(true);
    expect(summary.legacyDraftsLinked).toBe(true);
    expect(summary.stageCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("validates approval state transitions", () => {
    expect(validateApprovalTransition("NEEDS_APPROVAL", "APPROVED").allowed).toBe(true);
    expect(validateApprovalTransition("APPROVED", "EXECUTED").allowed).toBe(true);
    expect(validateApprovalTransition("NEEDS_APPROVAL", "EXECUTED").allowed).toBe(false);
    expect(validateApprovalTransition("EXECUTED", "APPROVED").allowed).toBe(false);
  });

  it("tracks stage completion by draft status", () => {
    expect(isStageComplete("NEEDS_APPROVAL", "ai-suggest")).toBe(true);
    expect(isStageComplete("NEEDS_APPROVAL", "manager-approve")).toBe(false);
    expect(isStageComplete("APPROVED", "manager-approve")).toBe(true);
    expect(isStageComplete("EXECUTED", "system-execute")).toBe(true);
  });

  it("builds approval workflow step with audit event", () => {
    const step = buildApprovalWorkflowStep({
      draftId: "draft-1",
      draftTitle: "Create PO",
      status: "APPROVED",
      stageId: "manager-approve",
      actor: "manager@demo",
      timestamp: "2026-06-09T09:30:00.000Z",
      auditEvent: "action_draft_approved",
    });
    expect(step.completed).toBe(true);
    expect(step.auditEvent).toBe("action_draft_approved");
  });

  it("builds demo approval workflow report", () => {
    const report = buildApprovalWorkflowDemoReport();
    expect(report.stageCount).toBe(4);
    expect(report.pendingCount).toBe(1);
    expect(report.approvedCount).toBe(1);
    expect(report.executedCount).toBe(1);
    expect(report.auditEventCount).toBe(AI_APPROVAL_WORKFLOW_DEMO_AUDIT.length);
    expect(report.steps.length).toBe(AI_APPROVAL_WORKFLOW_DEMO_DRAFTS.length * 4);
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[AI_APPROVAL_WORKFLOW_P2_109_NPM_SCRIPT]).toContain(
      "audit-ai-approval-workflow-p2-109.ts",
    );
    expect(pkg.scripts["test:ci:ai-approval-workflow-p2-109"]).toContain(
      AI_APPROVAL_WORKFLOW_P2_109_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, AI_APPROVAL_WORKFLOW_P2_109_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(AI_APPROVAL_WORKFLOW_P2_109_NPM_SCRIPT);

    expect(existsSync(join(ROOT, AI_APPROVAL_WORKFLOW_P2_109_DOC))).toBe(true);
    expect(
      formatAiApprovalWorkflowP2_109AuditLines(auditAiApprovalWorkflowP2_109(ROOT)).length,
    ).toBeGreaterThan(5);
  });
});
