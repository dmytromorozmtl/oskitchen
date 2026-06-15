import { describe, expect, it } from "vitest";

import { provisionExperimentAuditorFromScim } from "@/lib/auth/experiment-auditor-scim";

describe("SCIM experiment auditor webhook bearer guard", () => {
  it("rejects missing authorization header", async () => {
    const result = await provisionExperimentAuditorFromScim(
      {
        externalId: "ext-1",
        email: "auditor@example.com",
        active: true,
      },
      null,
    );
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("rejects invalid bearer token", async () => {
    const previous = process.env.EXPERIMENT_SCIM_WEBHOOK_SECRET;
    process.env.EXPERIMENT_SCIM_WEBHOOK_SECRET = "expected-secret";

    try {
      const result = await provisionExperimentAuditorFromScim(
        {
          externalId: "ext-1",
          email: "auditor@example.com",
          active: true,
        },
        "Bearer wrong-token",
      );
      expect(result.ok).toBe(false);
      expect(result.error).toBe("Unauthorized");
    } finally {
      if (previous === undefined) {
        delete process.env.EXPERIMENT_SCIM_WEBHOOK_SECRET;
      } else {
        process.env.EXPERIMENT_SCIM_WEBHOOK_SECRET = previous;
      }
    }
  });
});
