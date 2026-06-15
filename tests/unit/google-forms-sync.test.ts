import { describe, expect, it } from "vitest";

import {
  buildGoogleFormsSheetRange,
  externalGoogleFormsNote,
  parseGoogleFormsSheetValues,
} from "@/services/integrations/google-forms-sync-service";

describe("google forms sync service", () => {
  it("builds idempotent google forms row tags", () => {
    expect(externalGoogleFormsNote(42)).toBe("google-forms:row:42");
  });

  it("defaults sheet range to Form Responses 1", () => {
    expect(buildGoogleFormsSheetRange()).toBe("Form Responses 1!A:Z");
  });

  it("parses linked sheet values into submission rows", () => {
    const rows = parseGoogleFormsSheetValues([
      ["Timestamp", "Email", "Name", "Order", "Total", "Notes"],
      [
        "2026-06-01 12:00",
        "guest@example.com",
        "Jane Doe",
        "Meal prep box",
        "45",
        "No nuts",
      ],
      ["", "", "", "", "", ""],
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.rowNumber).toBe(2);
    expect(rows[0]?.customerEmail).toBe("guest@example.com");
    expect(rows[0]?.itemSummary).toBe("Meal prep box");
    expect(rows[0]?.total).toBe(45);
    expect(rows[0]?.notes).toBe("No nuts");
  });

  it("skips empty sheet rows", () => {
    const rows = parseGoogleFormsSheetValues([
      ["Timestamp", "Name"],
      ["", ""],
    ]);
    expect(rows).toHaveLength(0);
  });
});
