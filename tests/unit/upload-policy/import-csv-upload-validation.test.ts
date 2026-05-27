import { describe, expect, it } from "vitest";

import { validateImportCsvUpload } from "@/lib/upload-policy/media-upload-validation";

describe("validateImportCsvUpload", () => {
  it("rejects non-csv filenames", () => {
    const result = validateImportCsvUpload({
      bytes: new Uint8Array([1, 2, 3]),
      filename: "data.xlsx",
    });
    expect(result.ok).toBe(false);
  });

  it("accepts small csv files", () => {
    const result = validateImportCsvUpload({
      bytes: new Uint8Array([97, 98, 99]),
      filename: "ingredients.csv",
    });
    expect(result.ok).toBe(true);
  });
});
