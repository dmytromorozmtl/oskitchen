import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditBumpRecallAudit,
  formatBumpRecallAuditAuditLines,
} from "@/lib/kitchen/bump-recall-audit-p2-91-audit";
import { BUMP_RECALL_AUDIT_DIMENSIONS } from "@/lib/kitchen/bump-recall-audit-p2-91-content";
import {
  aggregateBumpRecallReport,
  buildBumpAuditMetadata,
  buildRecallAuditMetadata,
  formatElapsedSeconds,
  inferStationFromOrderItems,
  parseBumpRecallAuditRow,
  REMAKE_REASON_LATE_TICKET,
  REMAKE_REASON_OPERATOR_RECALL,
} from "@/lib/kitchen/bump-recall-audit-p2-91-operations";
import {
  BUMP_RECALL_AUDIT_CI_WORKFLOW,
  BUMP_RECALL_AUDIT_DIMENSION_COUNT,
  BUMP_RECALL_AUDIT_DOC,
  BUMP_RECALL_AUDIT_NPM_SCRIPT,
  BUMP_RECALL_AUDIT_POLICY_ID,
  BUMP_RECALL_AUDIT_ROUTE,
  BUMP_RECALL_AUDIT_TEST_IDS,
  BUMP_RECALL_AUDIT_UNIT_TEST,
} from "@/lib/kitchen/bump-recall-audit-p2-91-policy";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { KDS_OVERDUE_SECONDS } from "@/lib/kitchen/kds-queue-clarity-era18";

const ROOT = process.cwd();

describe("Bump/recall audit (P2-91)", () => {
  it("locks policy id, route, and four dimensions", () => {
    expect(BUMP_RECALL_AUDIT_POLICY_ID).toBe("bump-recall-audit-p2-91-v1");
    expect(BUMP_RECALL_AUDIT_ROUTE).toBe("/dashboard/kitchen/bump-recall-audit");
    expect(BUMP_RECALL_AUDIT_DIMENSION_COUNT).toBe(4);
    expect(BUMP_RECALL_AUDIT_DIMENSIONS).toHaveLength(4);
    expect(BUMP_RECALL_AUDIT_TEST_IDS).toHaveLength(5);
  });

  it("passes full bump/recall audit", () => {
    const summary = auditBumpRecallAudit(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.operationsWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.kdsActionsEnriched).toBe(true);
    expect(summary.auditActionsRegistered).toBe(true);
    expect(summary.dimensionCountCorrect).toBe(true);
    expect(summary.allTestIdsPresent).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("infers station from order items and builds bump metadata", () => {
    expect(inferStationFromOrderItems(["Cheeseburger", "Fries"])).toBe("grill");
    expect(inferStationFromOrderItems(["Caesar Salad"])).toBe("cold");

    const metadata = buildBumpAuditMetadata({
      actorUserId: "user-1",
      actorRole: "LINE_COOK",
      station: "grill",
      elapsedSeconds: KDS_OVERDUE_SECONDS + 60,
      orderStatusBefore: "PREPARING",
      itemCount: 2,
    });
    expect(metadata.lateTicket).toBe(true);
    expect(metadata.station).toBe("grill");
  });

  it("builds recall metadata with remake reason", () => {
    const onTime = buildRecallAuditMetadata({
      actorUserId: "user-1",
      actorRole: "EXPO",
      station: "expo",
      elapsedSeconds: 300,
    });
    expect(onTime.remakeReason).toBe(REMAKE_REASON_OPERATOR_RECALL);

    const late = buildRecallAuditMetadata({
      actorUserId: "user-1",
      actorRole: "EXPO",
      station: "expo",
      elapsedSeconds: KDS_OVERDUE_SECONDS + 1,
    });
    expect(late.remakeReason).toBe(REMAKE_REASON_LATE_TICKET);
  });

  it("parses audit rows and aggregates station summaries", () => {
    const bump = parseBumpRecallAuditRow({
      id: "log-1",
      action: AUDIT_ACTIONS.KITCHEN_ORDER_BUMPED,
      entityId: "order-1",
      userId: "user-1",
      actorEmail: "chef@example.com",
      actorRole: "LINE_COOK",
      createdAt: new Date("2026-06-09T12:00:00Z"),
      metadataJson: {
        bumpedByUserId: "user-1",
        bumpedByRole: "LINE_COOK",
        station: "grill",
        elapsedSecondsAtBump: 600,
        lateTicket: false,
      },
    });
    expect(bump?.kind).toBe("bump");
    expect(bump?.station).toBe("grill");

    const report = aggregateBumpRecallReport(bump ? [bump] : []);
    expect(report.bumpCount).toBe(1);
    expect(report.stationSummaries[0]?.station).toBe("grill");
    expect(formatElapsedSeconds(125)).toBe("2m 5s");
  });

  it("wires CI audit script and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    expect(pkg.scripts[BUMP_RECALL_AUDIT_NPM_SCRIPT]).toContain("audit-bump-recall-audit.ts");
    expect(pkg.scripts["test:ci:bump-recall-audit"]).toContain(BUMP_RECALL_AUDIT_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, BUMP_RECALL_AUDIT_CI_WORKFLOW), "utf8");
    expect(workflow).toContain(BUMP_RECALL_AUDIT_NPM_SCRIPT);

    expect(existsSync(join(ROOT, BUMP_RECALL_AUDIT_DOC))).toBe(true);
    expect(formatBumpRecallAuditAuditLines(auditBumpRecallAudit(ROOT)).length).toBeGreaterThan(5);
  });
});
