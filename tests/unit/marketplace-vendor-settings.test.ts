import { describe, expect, it } from "vitest";

import {
  defaultVendorCabinetSettings,
  mergeCabinetSettingsIntoDocuments,
  parseVendorCabinetSettings,
} from "@/lib/marketplace/vendor-settings-types";
import { validateVendorApiKey } from "@/services/marketplace/vendor-settings-service";

describe("vendor settings helpers", () => {
  it("round-trips cabinet settings in vendor documents", () => {
    const settings = defaultVendorCabinetSettings();
    settings.profile.description = "HoReCa supplier";
    settings.profile.deliveryZones = ["US-TX"];

    const documents = mergeCabinetSettingsIntoDocuments([], settings);
    const parsed = parseVendorCabinetSettings(documents);

    expect(parsed.profile.description).toBe("HoReCa supplier");
    expect(parsed.profile.deliveryZones).toEqual(["US-TX"]);
  });

  it("validates api keys against stored hash", () => {
    const settings = defaultVendorCabinetSettings();
    settings.apiKeyHash = "abc123";
    const documents = mergeCabinetSettingsIntoDocuments([], settings);

    expect(validateVendorApiKey(documents, "any")).toBe(false);
  });
});
