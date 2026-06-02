import { describe, expect, it } from "vitest";

import {
  parseKitchenVoiceUtterance,
  servingsFromStock,
} from "@/services/voice/kitchen-voice-service";

describe("kitchen-voice-service", () => {
  it("parses English inventory question", () => {
    const parsed = parseKitchenVoiceUtterance("OS Kitchen, how much chicken is left?");
    expect(parsed.intent).toBe("inventory_remaining");
    expect(parsed.ingredientPhrase).toContain("chicken");
  });

  it("parses Russian inventory question", () => {
    const parsed = parseKitchenVoiceUtterance("OS Kitchen, сколько осталось курицы?");
    expect(parsed.intent).toBe("inventory_remaining");
    expect(parsed.ingredientPhrase.length).toBeGreaterThan(2);
  });

  it("estimates bowl count from recipe yield", () => {
    expect(servingsFromStock(3.2, 2, 10)).toBe(16);
    expect(servingsFromStock(0, 2, 10)).toBe(0);
  });

  it("returns unknown for order phrasing", () => {
    const parsed = parseKitchenVoiceUtterance("OS Kitchen, add two lattes to table five");
    expect(parsed.intent).toBe("unknown");
  });
});
