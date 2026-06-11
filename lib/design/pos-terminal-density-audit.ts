import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_TERMINAL_DENSITY_CART_MODULE,
  POS_TERMINAL_DENSITY_MIN_TOUCH_PX,
  POS_TERMINAL_DENSITY_POLICY_ID,
  POS_TERMINAL_DENSITY_RECEIPT_MODULE,
  POS_TERMINAL_DENSITY_REQUIRED_ELEMENTS,
  POS_TERMINAL_DENSITY_TERMINAL_MODULE,
  POS_TERMINAL_DENSITY_TOUCH_TARGETS_MODULE,
} from "@/lib/design/pos-terminal-density-policy";

export type PosTerminalDensityAuditSummary = {
  policyId: typeof POS_TERMINAL_DENSITY_POLICY_ID;
  terminalModulePresent: boolean;
  receiptModulePresent: boolean;
  cartModulePresent: boolean;
  touchTargetsModulePresent: boolean;
  touchTargets44pxWired: boolean;
  contrastWired: boolean;
  spacingWired: boolean;
  checkoutProminentWired: boolean;
  passed: boolean;
};

export function auditPosTerminalDensity(
  root = process.cwd(),
): PosTerminalDensityAuditSummary {
  const terminalPath = join(root, POS_TERMINAL_DENSITY_TERMINAL_MODULE);
  const receiptPath = join(root, POS_TERMINAL_DENSITY_RECEIPT_MODULE);
  const cartPath = join(root, POS_TERMINAL_DENSITY_CART_MODULE);
  const touchTargetsPath = join(root, POS_TERMINAL_DENSITY_TOUCH_TARGETS_MODULE);

  const terminalModulePresent = existsSync(terminalPath);
  const receiptModulePresent = existsSync(receiptPath);
  const cartModulePresent = existsSync(cartPath);
  const touchTargetsModulePresent = existsSync(touchTargetsPath);

  let touchTargets44pxWired = false;
  let contrastWired = false;
  let spacingWired = false;
  let checkoutProminentWired = false;

  if (touchTargetsModulePresent) {
    const source = readFileSync(touchTargetsPath, "utf8");
    touchTargets44pxWired =
      source.includes(`POS_WCAG_FLOOR_PX = ${POS_TERMINAL_DENSITY_MIN_TOUCH_PX}`) &&
      source.includes("min-h-11 min-w-11");
  }

  if (terminalModulePresent) {
    const source = readFileSync(terminalPath, "utf8");
    touchTargets44pxWired =
      touchTargets44pxWired &&
      source.includes("posTouchCompactClass") &&
      source.includes("posTouchTileClass");
    contrastWired =
      source.includes("POS_TERMINAL_DENSITY_PRODUCT_TITLE_CLASS") &&
      source.includes("POS_TERMINAL_DENSITY_PRODUCT_PRICE_CLASS");
    spacingWired =
      source.includes("POS_TERMINAL_DENSITY_PRODUCT_GRID_CLASS") &&
      source.includes("POS_TERMINAL_DENSITY_PRODUCT_TILE_SURFACE_CLASS");
  }

  if (receiptModulePresent) {
    const source = readFileSync(receiptPath, "utf8");
    checkoutProminentWired =
      source.includes("POS_TERMINAL_DENSITY_CHECKOUT_BUTTON_CLASS") &&
      source.includes("POS_TERMINAL_DENSITY_CHECKOUT_WRAPPER_CLASS") &&
      source.includes("POS_TERMINAL_DENSITY_CHECKOUT_TEST_ID");
    contrastWired =
      contrastWired && source.includes("POS_TERMINAL_DENSITY_AMOUNT_DUE_CLASS");
  }

  if (cartModulePresent) {
    const source = readFileSync(cartPath, "utf8");
    touchTargets44pxWired =
      touchTargets44pxWired && source.includes("posTouchCompactClass");
  }

  const passed =
    terminalModulePresent &&
    receiptModulePresent &&
    cartModulePresent &&
    touchTargetsModulePresent &&
    touchTargets44pxWired &&
    contrastWired &&
    spacingWired &&
    checkoutProminentWired &&
    POS_TERMINAL_DENSITY_REQUIRED_ELEMENTS.length === 4;

  return {
    policyId: POS_TERMINAL_DENSITY_POLICY_ID,
    terminalModulePresent,
    receiptModulePresent,
    cartModulePresent,
    touchTargetsModulePresent,
    touchTargets44pxWired,
    contrastWired,
    spacingWired,
    checkoutProminentWired,
    passed,
  };
}

export function formatPosTerminalDensityAuditLines(
  summary: PosTerminalDensityAuditSummary,
): string[] {
  return [
    `POS terminal density audit (${summary.policyId})`,
    `Terminal module: ${summary.terminalModulePresent ? "present" : "missing"} (${POS_TERMINAL_DENSITY_TERMINAL_MODULE})`,
    `Receipt module: ${summary.receiptModulePresent ? "present" : "missing"} (${POS_TERMINAL_DENSITY_RECEIPT_MODULE})`,
    `Cart module: ${summary.cartModulePresent ? "present" : "missing"} (${POS_TERMINAL_DENSITY_CART_MODULE})`,
    `Touch targets (44px): ${summary.touchTargets44pxWired ? "yes" : "no"}`,
    `Contrast tokens: ${summary.contrastWired ? "yes" : "no"}`,
    `Spacing tokens: ${summary.spacingWired ? "yes" : "no"}`,
    `Checkout prominent: ${summary.checkoutProminentWired ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
