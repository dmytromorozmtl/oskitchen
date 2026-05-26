import { beforeEach, describe, expect, it } from "vitest";

import { encryptOrderPiiFields } from "@/lib/orders/order-pii";
import { assertOrderPiiEncrypted } from "@/tests/helpers/assert-order-pii-encrypted";

const ENCRYPTION_KEY_B64 = Buffer.alloc(32, 17).toString("base64");

describe("order PII invariant helper", () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = ENCRYPTION_KEY_B64;
  });

  it("accepts encrypted order PII payloads and validates decrypted read values", () => {
    const stored = {
      workspaceId: "ws-1",
      ...encryptOrderPiiFields({
        customerName: "Invariant Guest",
        customerEmail: "invariant@example.com",
        customerPhone: "+15550000011",
      }),
    };

    expect(() =>
      assertOrderPiiEncrypted(stored, {
        workspaceId: "ws-1",
        customerName: "Invariant Guest",
        customerEmail: "invariant@example.com",
        customerPhone: "+15550000011",
      }),
    ).not.toThrow();
  });

  it("fails when plaintext order email is passed as if it were stored DB state", () => {
    expect(() =>
      assertOrderPiiEncrypted(
        {
          workspaceId: "ws-1",
          customerName: "enc:v1:placeholder",
          customerEmail: "plaintext@example.com",
          customerPhone: null,
        },
        {
          workspaceId: "ws-1",
          customerName: "Invariant Guest",
          customerEmail: "plaintext@example.com",
          customerPhone: null,
        },
      ),
    ).toThrow();
  });
});
