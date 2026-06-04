import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  QR_GUEST_TOUCH_CONSUMERS,
  QR_GUEST_WCAG_FLOOR_PX,
  qrGuestPrimaryCtaClass,
  qrGuestShellClass,
  qrGuestStickyFooterClass,
  qrGuestTouchCompactClass,
} from "@/lib/qr/qr-guest-mobile-ui";
import { publicQrOrderPath } from "@/lib/qr/qr-order-meta";

/**
 * DES-18 — QR guest flow mobile-first policy (375px / 44px touch).
 *
 * @see components/qr/qr-ordering-client.tsx
 */

export const QR_GUEST_MOBILE_UI_POLICY_ID = "qr-guest-mobile-ui-des18-v1" as const;

export const QR_GUEST_MOBILE_VIEWPORT_PX = 375 as const;

export const QR_GUEST_ORDERING_PAGE_TEST_ID = "qr-ordering-page" as const;

export const QR_GUEST_ORDERING_MODULE = "components/qr/qr-ordering-client.tsx" as const;

export const QR_GUEST_SELF_SERVICE_MODULE = "components/qr/qr-table-self-service-client.tsx" as const;

export const QR_GUEST_MOBILE_ROUTES = [
  "/q/[slug]/[tableId]",
  "/q/table",
] as const;

export type QrGuestMobileViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export function findQrGuestMobileViolations(
  source = readFileSync(join(process.cwd(), QR_GUEST_ORDERING_MODULE), "utf8"),
): QrGuestMobileViolation[] {
  const violations: QrGuestMobileViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNo = i + 1;
    if (/\bh-9\b/.test(line) && line.includes("Button")) {
      violations.push({ pattern: "h-9-button", line: lineNo, excerpt: line.trim() });
    }
    if (/\bh-8\b/.test(line)) {
      violations.push({ pattern: "h-8", line: lineNo, excerpt: line.trim() });
    }
  }

  return violations;
}

export type QrGuestMobileAudit = {
  policyId: typeof QR_GUEST_MOBILE_UI_POLICY_ID;
  viewportPx: typeof QR_GUEST_MOBILE_VIEWPORT_PX;
  wcagFloorPx: typeof QR_GUEST_WCAG_FLOOR_PX;
  violations: QrGuestMobileViolation[];
  passed: boolean;
};

export function auditQrGuestMobileUi(
  source = readFileSync(join(process.cwd(), QR_GUEST_ORDERING_MODULE), "utf8"),
): QrGuestMobileAudit {
  const violations = findQrGuestMobileViolations(source);
  return {
    policyId: QR_GUEST_MOBILE_UI_POLICY_ID,
    viewportPx: QR_GUEST_MOBILE_VIEWPORT_PX,
    wcagFloorPx: QR_GUEST_WCAG_FLOOR_PX,
    violations,
    passed: violations.length === 0,
  };
}

export function qrGuestMobileShellSummary(input: {
  storeSlug: string;
  tableRouteId: string;
  tableLabel: string;
}): {
  path: string;
  viewport: string;
  touchFloor: string;
} {
  return {
    path: publicQrOrderPath(input.storeSlug, input.tableRouteId),
    viewport: `${QR_GUEST_MOBILE_VIEWPORT_PX}px`,
    touchFloor: `${QR_GUEST_WCAG_FLOOR_PX}px`,
  };
}

export const QR_GUEST_MOBILE_CLASS_TOKENS = {
  shell: qrGuestShellClass,
  compact: qrGuestTouchCompactClass,
  primaryCta: qrGuestPrimaryCtaClass,
  stickyFooter: qrGuestStickyFooterClass,
} as const;

export const QR_GUEST_MOBILE_CONSUMERS = QR_GUEST_TOUCH_CONSUMERS;
