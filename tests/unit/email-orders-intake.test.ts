import { describe, expect, it } from "vitest";

import {
  externalEmailOrderNote,
  hashEmailOrderContent,
  parseEmailOrderText,
} from "@/services/integrations/email-orders-intake-service";

const SAMPLE = `From: Jane Doe <jane@example.com>
Subject: Friday pickup

Hi team,

2x Meal prep box
1x Soup

Total: $58

Thanks!`;

describe("email orders intake service", () => {
  it("builds idempotent email order hash tags", () => {
    const hash = hashEmailOrderContent("hello");
    expect(externalEmailOrderNote(hash)).toBe(`email-orders:hash:${hash}`);
  });

  it("parses From, Subject, line items, and total from pasted email", () => {
    const parsed = parseEmailOrderText(SAMPLE);
    expect(parsed).not.toBeNull();
    expect(parsed?.customerEmail).toBe("jane@example.com");
    expect(parsed?.customerName).toBe("Jane Doe");
    expect(parsed?.subject).toBe("Friday pickup");
    expect(parsed?.lineItems.some((l) => l.title.includes("Meal prep box"))).toBe(true);
    expect(parsed?.total).toBe(58);
  });

  it("returns null for too-short input", () => {
    expect(parseEmailOrderText("short")).toBeNull();
  });

  it("dedupes by stable content hash", () => {
    const a = parseEmailOrderText(SAMPLE);
    const b = parseEmailOrderText(SAMPLE);
    expect(a?.contentHash).toBe(b?.contentHash);
  });
});
