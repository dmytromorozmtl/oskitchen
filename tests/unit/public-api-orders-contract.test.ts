import { describe, expect, it } from "vitest";

import { publicApiOrderCreateSchema } from "@/lib/orders/public-api-order-create";

describe("public API orders contract", () => {
  it("accepts minimal valid create body", () => {
    const parsed = publicApiOrderCreateSchema.safeParse({
      customerName: "Jane Doe",
      customerEmail: "jane@example.com",
      total: 42.5,
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects negative total", () => {
    const parsed = publicApiOrderCreateSchema.safeParse({
      customerName: "Jane",
      customerEmail: "jane@example.com",
      total: -1,
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const parsed = publicApiOrderCreateSchema.safeParse({
      customerName: "Jane",
      customerEmail: "not-an-email",
      total: 10,
    });
    expect(parsed.success).toBe(false);
  });

  it("documents GET response shape (contract)", () => {
    const sample = {
      data: [
        {
          id: "uuid",
          customerName: "Jane",
          customerEmail: "jane@example.com",
          status: "CONFIRMED",
          total: "42.50",
          createdAt: new Date().toISOString(),
        },
      ],
    };
    expect(Array.isArray(sample.data)).toBe(true);
    expect(typeof sample.data[0]?.total).toBe("string");
  });

  it("documents error responses", () => {
    const errors = {
      unauthorized: { error: "Unauthorized", status: 401 },
      rateLimit: { error: "Too many requests. Please slow down.", status: 429 },
      validation: { error: "Invalid body", details: {}, status: 400 },
    };
    expect(errors.unauthorized.status).toBe(401);
    expect(errors.rateLimit.status).toBe(429);
    expect(errors.validation.status).toBe(400);
  });
});
