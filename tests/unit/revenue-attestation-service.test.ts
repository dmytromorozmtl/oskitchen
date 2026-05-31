import { describe, expect, it } from "vitest";

import {
  canonicalRevenueAttestationPayload,
  REVENUE_ATTESTATION_DISCLAIMER,
  signRevenueAttestationPayload,
  verifyRevenueAttestationSignature,
  type RevenueAttestationSignedPayload,
} from "@/lib/commercial/revenue-attestation-signing";
import {
  buildRevenueAttestationExportDocument,
  isAllowedAttestationMonths,
  verifyRevenueAttestationDocument,
} from "@/services/commercial/revenue-attestation-service";

const samplePayloadBase = {
  attestationId: "11111111-1111-1111-1111-111111111111",
  workspaceId: "22222222-2222-2222-2222-222222222222",
  businessName: "Pilot Meal Prep",
  periodStart: "2025-06-01",
  periodEnd: "2026-05-31",
  grossOrderRevenue: 842120.45,
  orderCount: 12480,
  cancelledOrderCount: 120,
  currency: "USD",
  locationsIncluded: ["loc-b", "loc-a"],
  revenueStatusDefinition: "eligible statuses only",
  generatedAt: "2026-05-31T12:00:00.000Z",
  expiresAt: "2026-06-30T12:00:00.000Z",
  disclaimer: REVENUE_ATTESTATION_DISCLAIMER,
};

describe("revenue-attestation-signing", () => {
  it("signs and verifies canonical payload", () => {
    const signature = signRevenueAttestationPayload(samplePayloadBase);
    expect(signature).toHaveLength(64);

    const payload: RevenueAttestationSignedPayload = {
      version: "kitchenos-revenue-attestation-v1",
      ...samplePayloadBase,
      locationsIncluded: ["loc-a", "loc-b"],
    };

    expect(
      verifyRevenueAttestationSignature({
        payload,
        signature,
      }),
    ).toBe(true);

    expect(
      verifyRevenueAttestationSignature({
        payload: { ...payload, grossOrderRevenue: 1 },
        signature,
      }),
    ).toBe(false);
  });

  it("sorts location ids in canonical JSON", () => {
    const a = canonicalRevenueAttestationPayload({
      ...samplePayloadBase,
      locationsIncluded: ["z", "a"],
    });
    const b = canonicalRevenueAttestationPayload({
      ...samplePayloadBase,
      locationsIncluded: ["a", "z"],
    });
    expect(a).toBe(b);
  });
});

describe("revenue-attestation-service helpers", () => {
  it("validates allowed month windows", () => {
    expect(isAllowedAttestationMonths(12)).toBe(true);
    expect(isAllowedAttestationMonths(9)).toBe(false);
  });

  it("builds export document with verify URL", () => {
    const doc = buildRevenueAttestationExportDocument({
      attestationId: samplePayloadBase.attestationId,
      aggregate: {
        periodStart: samplePayloadBase.periodStart,
        periodEnd: samplePayloadBase.periodEnd,
        grossOrderRevenue: samplePayloadBase.grossOrderRevenue,
        orderCount: samplePayloadBase.orderCount,
        cancelledOrderCount: samplePayloadBase.cancelledOrderCount,
        currency: samplePayloadBase.currency,
        locationCount: 2,
        locationsIncluded: ["loc-a", "loc-b"],
        tenureDays: 400,
        workspaceId: samplePayloadBase.workspaceId,
        businessName: samplePayloadBase.businessName,
        hasOrderData: true,
      },
      verifyBaseUrl: "https://app.example.com",
    });

    expect(doc.verifyUrl).toBe("https://app.example.com/api/capital/revenue-attestation/verify");
    expect(verifyRevenueAttestationDocument(doc).valid).toBe(true);
  });

  it("flags expired attestations", () => {
    const doc = buildRevenueAttestationExportDocument({
      attestationId: samplePayloadBase.attestationId,
      aggregate: {
        periodStart: samplePayloadBase.periodStart,
        periodEnd: samplePayloadBase.periodEnd,
        grossOrderRevenue: samplePayloadBase.grossOrderRevenue,
        orderCount: samplePayloadBase.orderCount,
        cancelledOrderCount: samplePayloadBase.cancelledOrderCount,
        currency: samplePayloadBase.currency,
        locationCount: 1,
        locationsIncluded: ["loc-a"],
        tenureDays: 10,
        workspaceId: samplePayloadBase.workspaceId,
        businessName: null,
        hasOrderData: true,
      },
      generatedAt: new Date("2020-01-01T00:00:00.000Z"),
      expiresAt: new Date("2020-02-01T00:00:00.000Z"),
    });

    const result = verifyRevenueAttestationDocument(doc);
    expect(result.valid).toBe(true);
    expect(result.expired).toBe(true);
  });
});
