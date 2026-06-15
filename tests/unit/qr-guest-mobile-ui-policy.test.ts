import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditQrGuestMobileUi,
  QR_GUEST_MOBILE_UI_POLICY_ID,
  QR_GUEST_MOBILE_VIEWPORT_PX,
  qrGuestMobileShellSummary,
} from "@/lib/qr/qr-guest-mobile-ui-policy";
import {
  QR_GUEST_WCAG_FLOOR_PX,
  qrGuestPrimaryCtaClass,
  qrGuestStickyFooterClass,
  qrGuestTouchCompactClass,
} from "@/lib/qr/qr-guest-mobile-ui";

const ROOT = process.cwd();

describe("QR guest mobile UI policy (DES-18)", () => {
  it("locks DES-18 policy id and 375px viewport", () => {
    expect(QR_GUEST_MOBILE_UI_POLICY_ID).toBe("qr-guest-mobile-ui-des18-v1");
    expect(QR_GUEST_MOBILE_VIEWPORT_PX).toBe(375);
    expect(QR_GUEST_WCAG_FLOOR_PX).toBe(44);
  });

  it("passes audit on live qr-ordering-client (no h-9 buttons)", () => {
    const audit = auditQrGuestMobileUi();
    expect(audit.violations).toEqual([]);
    expect(audit.passed).toBe(true);
  });

  it("exposes 44px touch helpers", () => {
    expect(qrGuestTouchCompactClass).toContain("min-h-11");
    expect(qrGuestPrimaryCtaClass).toContain("min-h-12");
    expect(qrGuestStickyFooterClass).toContain("safe-area-inset-bottom");
  });

  it("builds mobile shell summary for table route", () => {
    const summary = qrGuestMobileShellSummary({
      storeSlug: "demo-bistro",
      tableRouteId: "table-12",
      tableLabel: "Table 12",
    });
    expect(summary.path).toBe("/q/demo-bistro/table-12");
    expect(summary.viewport).toBe("375px");
  });

  it("wires mobile UI tokens into QR guest clients", () => {
    const ordering = readFileSync(
      join(ROOT, "components/qr/qr-ordering-client.tsx"),
      "utf8",
    );
    const selfService = readFileSync(
      join(ROOT, "components/qr/qr-table-self-service-client.tsx"),
      "utf8",
    );
    expect(ordering).toContain("qrGuestShellClass");
    expect(ordering).toContain("qr-cart-drawer-handle");
    expect(selfService).toContain("qrGuestStickyFooterClass");
  });
});
