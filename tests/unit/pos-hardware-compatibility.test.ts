import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  certifiedDevicesByCategory,
  certifiedDevicesByVendor,
  POS_CERTIFIED_HARDWARE_DEVICES,
  POS_CERTIFIED_HARDWARE_VENDORS,
  POS_HARDWARE_COMPATIBILITY_DOC,
} from "@/lib/pos/pos-hardware-certification";

describe("POS hardware compatibility", () => {
  it("ships the compatibility doc on disk", () => {
    const docPath = resolve(process.cwd(), POS_HARDWARE_COMPATIBILITY_DOC);
    const contents = readFileSync(docPath, "utf8");
    expect(contents).toContain("Epson");
    expect(contents).toContain("PAX");
    expect(contents).toContain("Star Micronics");
    expect(contents).toContain("Barcode scanners");
  });

  it("lists required certified vendors", () => {
    expect(POS_CERTIFIED_HARDWARE_VENDORS).toEqual(
      expect.arrayContaining(["Epson", "PAX", "Star Micronics"]),
    );
  });

  it("indexes barcode scanners and payment terminals", () => {
    const scanners = certifiedDevicesByCategory("barcode_scanner");
    const epson = certifiedDevicesByVendor("Epson");
    const pax = certifiedDevicesByVendor("PAX");
    const star = certifiedDevicesByVendor("Star Micronics");

    expect(scanners.length).toBeGreaterThanOrEqual(3);
    expect(epson.length).toBeGreaterThanOrEqual(2);
    expect(pax.length).toBeGreaterThanOrEqual(2);
    expect(star.length).toBeGreaterThanOrEqual(2);
    expect(POS_CERTIFIED_HARDWARE_DEVICES.length).toBeGreaterThanOrEqual(12);
  });
});
