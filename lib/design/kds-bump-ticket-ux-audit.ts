import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  KDS_BUMP_TICKET_DAILY_SERVICE_MODULE,
  KDS_BUMP_TICKET_HAPTICS_MODULE,
  KDS_BUMP_TICKET_MIN_TOUCH_PX,
  KDS_BUMP_TICKET_NEXT_STRIP_MODULE,
  KDS_BUMP_TICKET_UX_POLICY_ID,
  KDS_BUMP_TICKET_UX_REQUIRED_ELEMENTS,
  KDS_BUMP_TICKET_UNDO_STRIP_MODULE,
  KDS_BUMP_TICKET_UNDO_WINDOW_MS,
} from "@/lib/design/kds-bump-ticket-ux-policy";

export type KdsBumpTicketUxAuditSummary = {
  policyId: typeof KDS_BUMP_TICKET_UX_POLICY_ID;
  dailyServicePresent: boolean;
  nextStripPresent: boolean;
  undoStripPresent: boolean;
  hapticsPresent: boolean;
  largeTargetWired: boolean;
  hapticWired: boolean;
  visualConfirmationWired: boolean;
  undo3sWired: boolean;
  passed: boolean;
};

export function auditKdsBumpTicketUx(root = process.cwd()): KdsBumpTicketUxAuditSummary {
  const dailyPath = join(root, KDS_BUMP_TICKET_DAILY_SERVICE_MODULE);
  const nextStripPath = join(root, KDS_BUMP_TICKET_NEXT_STRIP_MODULE);
  const undoStripPath = join(root, KDS_BUMP_TICKET_UNDO_STRIP_MODULE);
  const hapticsPath = join(root, KDS_BUMP_TICKET_HAPTICS_MODULE);
  const policyPath = join(root, "lib/design/kds-bump-ticket-ux-policy.ts");

  const dailyServicePresent = existsSync(dailyPath);
  const nextStripPresent = existsSync(nextStripPath);
  const undoStripPresent = existsSync(undoStripPath);
  const hapticsPresent = existsSync(hapticsPath);

  let largeTargetWired = false;
  let hapticWired = false;
  let visualConfirmationWired = false;
  let undo3sWired = false;

  if (existsSync(policyPath)) {
    const policySource = readFileSync(policyPath, "utf8");
    largeTargetWired =
      policySource.includes(`KDS_BUMP_TICKET_MIN_TOUCH_PX = ${KDS_BUMP_TICKET_MIN_TOUCH_PX}`) &&
      policySource.includes("KDS_BUMP_TICKET_BUTTON_CLASS");
    undo3sWired = policySource.includes(
      `KDS_BUMP_TICKET_UNDO_WINDOW_MS = ${KDS_BUMP_TICKET_UNDO_WINDOW_MS}`,
    );
  }

  if (dailyServicePresent) {
    const source = readFileSync(dailyPath, "utf8");
    largeTargetWired =
      largeTargetWired &&
      source.includes("KDS_BUMP_TICKET_BUTTON_CLASS");
    hapticWired = source.includes("triggerKdsHaptic");
    visualConfirmationWired =
      source.includes("KDS_BUMP_TICKET_CONFIRMATION_CLASS") &&
      source.includes("confirmedBumpId");
    undo3sWired =
      undo3sWired &&
      source.includes("KdsBumpUndoStrip") &&
      source.includes("KDS_BUMP_TICKET_UNDO_WINDOW_MS");
  }

  if (nextStripPresent) {
    const source = readFileSync(nextStripPath, "utf8");
    largeTargetWired =
      largeTargetWired && source.includes("KDS_BUMP_TICKET_BUTTON_CLASS");
    hapticWired = hapticWired && source.includes("triggerKdsHaptic");
  }

  if (undoStripPresent) {
    const source = readFileSync(undoStripPath, "utf8");
    undo3sWired =
      undo3sWired &&
      source.includes("KDS_BUMP_TICKET_UNDO_STRIP_TEST_ID") &&
      source.includes("KDS_BUMP_TICKET_UNDO_BUTTON_TEST_ID");
  }

  const passed =
    dailyServicePresent &&
    nextStripPresent &&
    undoStripPresent &&
    hapticsPresent &&
    largeTargetWired &&
    hapticWired &&
    visualConfirmationWired &&
    undo3sWired &&
    KDS_BUMP_TICKET_UX_REQUIRED_ELEMENTS.length === 4;

  return {
    policyId: KDS_BUMP_TICKET_UX_POLICY_ID,
    dailyServicePresent,
    nextStripPresent,
    undoStripPresent,
    hapticsPresent,
    largeTargetWired,
    hapticWired,
    visualConfirmationWired,
    undo3sWired,
    passed,
  };
}

export function formatKdsBumpTicketUxAuditLines(
  summary: KdsBumpTicketUxAuditSummary,
): string[] {
  return [
    `KDS bump ticket UX audit (${summary.policyId})`,
    `Daily service: ${summary.dailyServicePresent ? "present" : "missing"} (${KDS_BUMP_TICKET_DAILY_SERVICE_MODULE})`,
    `Bump next strip: ${summary.nextStripPresent ? "present" : "missing"} (${KDS_BUMP_TICKET_NEXT_STRIP_MODULE})`,
    `Undo strip: ${summary.undoStripPresent ? "present" : "missing"} (${KDS_BUMP_TICKET_UNDO_STRIP_MODULE})`,
    `Large target (64px): ${summary.largeTargetWired ? "yes" : "no"}`,
    `Haptic feedback: ${summary.hapticWired ? "yes" : "no"}`,
    `Visual confirmation: ${summary.visualConfirmationWired ? "yes" : "no"}`,
    `3s undo: ${summary.undo3sWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
