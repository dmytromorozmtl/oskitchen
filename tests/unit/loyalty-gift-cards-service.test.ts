import { describe, expect, it } from "vitest";

import {
  DEFAULT_GIFT_CARD_PROGRAM,
  encodeGiftCardNotes,
  parseGiftCardNotes,
  parseGiftCardProgramSettings,
} from "@/lib/loyalty/gift-cards-settings";

describe("loyalty gift-cards-service", () => {
  it("parses gift card program settings", () => {
    const program = parseGiftCardProgramSettings({
      digitalEnabled: false,
      physicalEnabled: true,
      denominations: [25, 50, 99999],
      physicalCodePrefix: "pgc",
    });
    expect(program.digitalEnabled).toBe(false);
    expect(program.physicalEnabled).toBe(true);
    expect(program.denominations).toEqual([25, 50]);
    expect(program.physicalCodePrefix).toBe("PGC");
  });

  it("round-trips digital and physical metadata in notes", () => {
    const digital = encodeGiftCardNotes({
      delivery: "digital",
      recipientEmail: "guest@example.com",
    });
    const parsedDigital = parseGiftCardNotes(digital);
    expect(parsedDigital.meta.delivery).toBe("digital");
    expect(parsedDigital.meta.recipientEmail).toBe("guest@example.com");

    const physical = encodeGiftCardNotes({
      delivery: "physical",
      batchId: "BATCH-TEST",
      printed: false,
      label: "$50 card",
    });
    const parsedPhysical = parseGiftCardNotes(physical);
    expect(parsedPhysical.meta.delivery).toBe("physical");
    expect(parsedPhysical.meta.batchId).toBe("BATCH-TEST");
    expect(parsedPhysical.meta.printed).toBe(false);
  });

  it("defaults program when settings missing", () => {
    expect(DEFAULT_GIFT_CARD_PROGRAM.digitalEnabled).toBe(true);
    expect(DEFAULT_GIFT_CARD_PROGRAM.physicalEnabled).toBe(true);
    expect(DEFAULT_GIFT_CARD_PROGRAM.denominations.length).toBeGreaterThan(0);
  });
});
