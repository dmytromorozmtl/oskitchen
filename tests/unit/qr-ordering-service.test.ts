import { describe, expect, it } from "vitest";

import {
  buildQrOrderSourceMetadata,
  isQrTableOrder,
  publicQrOrderPath,
  readQrTableLabel,
} from "@/lib/qr/qr-order-meta";

describe("qr order metadata", () => {
  it("builds table qr metadata", () => {
    const meta = buildQrOrderSourceMetadata({
      storeSlug: "riverside",
      tableRouteId: "12",
      tableLabel: "Table 12",
      restaurantTableId: "uuid-1",
    });
    expect(isQrTableOrder(meta)).toBe(true);
    expect(readQrTableLabel(meta)).toBe("Table 12");
  });

  it("public path encodes table id", () => {
    expect(publicQrOrderPath("my-store", "12")).toBe("/q/my-store/12");
    expect(publicQrOrderPath("my-store", "Patio A")).toBe("/q/my-store/Patio%20A");
  });
});
