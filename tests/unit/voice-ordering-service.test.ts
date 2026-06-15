import { describe, expect, it } from "vitest";

import {
  buildVoiceOrderSourceMetadata,
  isVoiceOrder,
  readVoiceTableLabel,
} from "@/lib/voice/voice-order-meta";
import { parseVoiceUtterance } from "@/services/voice/voice-ordering-service";

describe("voice order metadata", () => {
  it("builds voice metadata with channel and table", () => {
    const meta = buildVoiceOrderSourceMetadata({
      channel: "alexa",
      utterance: "add two lattes to table 5",
      tableLabel: "Table 5",
      confidence: 85,
      parsedSummary: "2× Latte",
    });
    expect(isVoiceOrder(meta)).toBe(true);
    expect(readVoiceTableLabel(meta)).toBe("Table 5");
    expect(meta.voice?.channel).toBe("alexa");
  });
});

describe("parseVoiceUtterance", () => {
  it("parses alexa-style table order", () => {
    const p = parseVoiceUtterance("Alexa, ask OS Kitchen to add two lattes to table 5");
    expect(p.tableRouteId).toBe("5");
    expect(p.tableLabel).toBe("Table 5");
    expect(p.quantity).toBe(2);
    expect(p.itemPhrase).toContain("latte");
  });

  it("parses google home phrasing", () => {
    const p = parseVoiceUtterance("Ok Google, order one espresso for table patio-a");
    expect(p.tableRouteId).toBe("patio-a");
    expect(p.quantity).toBe(1);
    expect(p.itemPhrase).toContain("espresso");
  });

  it("extracts modifiers after with", () => {
    const p = parseVoiceUtterance("add 1 burger to table 2 with no onions");
    expect(p.modifiers).toMatch(/no onions/i);
    expect(p.tableRouteId).toBe("2");
  });
});
