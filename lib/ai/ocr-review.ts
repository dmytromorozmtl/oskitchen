import { AppFeedbackType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type OCRReviewResult =
  | { status: "posted"; confidence: number }
  | { status: "pending_review"; confidence: number; taskId: string };

const REVIEW_THRESHOLD = 0.85;

/**
 * When OCR confidence is below threshold, queue human review instead of auto-posting.
 */
export async function handleOCRResult(input: {
  userId: string;
  invoiceId: string;
  extractedData: Record<string, unknown>;
  confidence: number;
}): Promise<OCRReviewResult> {
  if (input.confidence >= REVIEW_THRESHOLD) {
    return { status: "posted", confidence: input.confidence };
  }

  const task = await prisma.appFeedback.create({
    data: {
      userId: input.userId,
      type: AppFeedbackType.GENERAL,
      title: `OCR review — invoice ${input.invoiceId}`,
      message: JSON.stringify(input.extractedData).slice(0, 8000),
      route: "/dashboard/accounting/invoices",
      featureArea: "ocr_review_queue",
    },
  });

  return {
    status: "pending_review",
    confidence: input.confidence,
    taskId: task.id,
  };
}
