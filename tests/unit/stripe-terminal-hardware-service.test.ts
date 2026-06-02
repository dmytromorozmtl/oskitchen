import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  catalogEntryForDeviceType,
  formatStripeTerminalDeviceLabel,
} from "@/lib/payments/stripe-terminal-hardware-types";
import {
  getStripeTerminalHardwareDashboard,
  registerPhysicalReader,
} from "@/services/payments/stripe-terminal-hardware-service";

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  const kitchen = {
    settingsCenterJson: null as unknown,
    businessName: "Test Bistro",
  };
  return {
    prisma: {
      kitchenSettings: {
        findUnique: vi.fn(async () => kitchen),
        upsert: vi.fn(async (_args: unknown) => {
          return {};
        }),
      },
      pOSAuditEvent: { create: vi.fn() },
    },
  };
});

import { getStripe } from "@/lib/stripe";

describe("stripe terminal hardware types", () => {
  it("labels known device types", () => {
    expect(formatStripeTerminalDeviceLabel("stripe_m2")).toBe("M2");
    expect(catalogEntryForDeviceType("bbpos_wisepos_e")?.label).toContain("WisePOS");
  });
});

describe("stripe-terminal-hardware-service", () => {
  const userId = "00000000-0000-4000-8000-000000000010";

  beforeEach(() => {
    vi.mocked(getStripe).mockReset();
  });

  it("dashboard reports stripe not configured", async () => {
    vi.mocked(getStripe).mockReturnValue(null);
    const dash = await getStripeTerminalHardwareDashboard(userId);
    expect(dash.stripeConfigured).toBe(false);
    expect(dash.catalog.length).toBe(3);
  });

  it("registers reader when stripe mock succeeds", async () => {
    vi.mocked(getStripe).mockReturnValue({
      terminal: {
        locations: {
          retrieve: vi.fn().mockRejectedValue(new Error("missing")),
          create: vi.fn().mockResolvedValue({ id: "tml_test" }),
        },
        readers: {
          create: vi.fn().mockResolvedValue({
            id: "tmr_test",
            label: "Front",
            serial_number: "SN-1",
            status: "online",
            device_type: "stripe_m2",
          }),
          list: vi.fn().mockResolvedValue({ data: [] }),
          del: vi.fn(),
        },
      },
    } as never);

    const result = await registerPhysicalReader({
      userId,
      registrationCode: "test-code-123",
      label: "Front counter",
      deviceType: "stripe_m2",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.reader.stripeReaderId).toBe("tmr_test");
      expect(result.reader.deviceType).toBe("stripe_m2");
    }
  });

  it("fails register without stripe", async () => {
    vi.mocked(getStripe).mockReturnValue(null);
    const result = await registerPhysicalReader({
      userId,
      registrationCode: "test-code-123",
      label: "Front",
      deviceType: "verifone_p400",
    });
    expect(result.ok).toBe(false);
  });
});
