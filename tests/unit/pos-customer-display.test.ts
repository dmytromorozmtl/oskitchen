import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CustomerDisplay, formatCustomerDisplayMoney } from "@/components/pos/customer-display";
import {
  POS_CUSTOMER_DISPLAY_COMPONENT,
  POS_CUSTOMER_DISPLAY_ROUTE,
} from "@/lib/pos/pos-desktop-shortcuts-policy";
import { POS_HARDWARE_CATEGORIES } from "@/lib/pos/pos-hardware";

describe("POS customer display", () => {
  it("locks component path and route", () => {
    expect(POS_CUSTOMER_DISPLAY_COMPONENT).toBe("components/pos/customer-display.tsx");
    expect(POS_CUSTOMER_DISPLAY_ROUTE).toBe("/dashboard/pos/terminal/customer-display");
  });

  it("marks customer display hardware as supported", () => {
    const row = POS_HARDWARE_CATEGORIES.find((category) => category.id === "customer_display");
    expect(row?.status).toBe("supported");
    expect(row?.detail).toContain("customer-display");
  });

  it("formats currency for large second-screen totals", () => {
    expect(formatCustomerDisplayMoney(12.5)).toMatch(/\$12\.50/);
  });

  it("renders idle state without line items", () => {
    const html = renderToStaticMarkup(
      createElement(CustomerDisplay, {
        registerName: "Front counter",
        lines: [],
        subtotal: 0,
        discount: 0,
        total: 0,
        paymentLabel: "Cash",
      }),
    );
    expect(html).toContain('data-testid="pos-customer-display"');
    expect(html).toContain('data-testid="pos-customer-display-idle"');
    expect(html).toContain("Front counter");
  });

  it("renders cart lines, discount, and payment label", () => {
    const html = renderToStaticMarkup(
      createElement(CustomerDisplay, {
        registerName: "Bar",
        lines: [
          { title: "Latte", quantity: 2, lineTotal: 9 },
          { title: "Muffin", quantity: 1, lineTotal: 4.5 },
        ],
        subtotal: 13.5,
        discount: 1.5,
        total: 12,
        paymentLabel: "Card terminal",
      }),
    );
    expect(html).toContain('data-testid="pos-customer-display-line"');
    expect(html).toContain("Latte");
    expect(html).toContain("Card terminal");
    expect(html).toContain("$12.00");
  });
});
