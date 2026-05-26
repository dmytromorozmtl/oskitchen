import { describe, expect, it } from "vitest";

import { summariseImplementationExternalCertification } from "@/lib/implementation/external-integration-certification";

describe("implementation external integration certification", () => {
  it("fails required certification when planned live-capable providers lack evidence", () => {
    const result = summariseImplementationExternalCertification({
      plannedIntegrationKeys: ["shopify"],
      connections: [
        {
          provider: "SHOPIFY",
          status: "CONNECTED",
          lastHealthStatus: "OK",
          lastSyncAt: null,
          processedWebhookCount: 0,
        },
      ],
    });

    expect(result.certificationCheck.required).toBe(true);
    expect(result.certificationCheck.status).toBe("FAIL");
    expect(result.missingProviders).toEqual(["SHOPIFY"]);
  });

  it("passes certification once health and sync evidence exist", () => {
    const result = summariseImplementationExternalCertification({
      plannedIntegrationKeys: ["shopify"],
      connections: [
        {
          provider: "SHOPIFY",
          status: "CONNECTED",
          lastHealthStatus: "OK",
          lastSyncAt: new Date("2026-05-26T09:00:00.000Z"),
          processedWebhookCount: 1,
        },
      ],
    });

    expect(result.certificationCheck.required).toBe(true);
    expect(result.certificationCheck.status).toBe("PASS");
    expect(result.certifiedProviders).toEqual(["SHOPIFY"]);
    expect(result.missingProviders).toEqual([]);
  });

  it("warns when placeholder integrations remain in project discovery scope", () => {
    const result = summariseImplementationExternalCertification({
      plannedIntegrationKeys: ["uber_eats", "uber_direct"],
      connections: [],
    });

    expect(result.certificationCheck.required).toBe(false);
    expect(result.certificationCheck.status).toBe("PASS");
    expect(result.placeholderCheck).toMatchObject({
      status: "WARN",
      title: "Placeholder integrations do not count toward go-live",
    });
    expect(result.placeholderLabels).toEqual(["Uber Eats", "Uber Direct"]);
  });
});
