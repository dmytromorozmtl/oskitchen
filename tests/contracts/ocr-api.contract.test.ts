import { describe, expect, it } from "vitest";
import { z } from "zod";

const ocrResponseSchema = z.object({
  success: z.boolean(),
  pendingReview: z.boolean().optional(),
  reviewTaskId: z.string().optional(),
  confidence: z.number().optional(),
  message: z.string().optional(),
});

describe("POST /api/accounting/ocr contract", () => {
  it("accepts pending review envelope", () => {
    expect(
      ocrResponseSchema.safeParse({
        success: true,
        pendingReview: true,
        reviewTaskId: "task-1",
        confidence: 0.72,
        message: "Low confidence",
      }).success,
    ).toBe(true);
  });
});
