import { NextResponse } from "next/server";
import { z } from "zod";

import { handleOCRResult } from "@/lib/ai/ocr-review";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { createInvoiceFromOCR, processInvoiceWithOCR } from "@/services/accounting/ocr-service";

const ocrSchema = z.object({
  imageBase64: z.string().min(1),
  autoCreate: z.boolean().default(true),
});

export async function POST(request: Request) {
  const { userId, workspaceId } = await requireTenantActor();

  try {
    const body = await request.json();
    const parsed = ocrSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const ocrResult = await processInvoiceWithOCR(
      parsed.data.imageBase64,
      userId,
      workspaceId,
    );

    if (!ocrResult.supplierName && ocrResult.totalAmount == null) {
      return NextResponse.json(
        {
          success: false,
          message: "Could not extract invoice data. Please try a clearer image or enter manually.",
          ocrResult,
        },
        { status: 422 },
      );
    }

    const review = await handleOCRResult({
      userId,
      invoiceId: ocrResult.invoiceNumber ?? "pending",
      extractedData: ocrResult as unknown as Record<string, unknown>,
      confidence: ocrResult.confidence,
    });

    if (review.status === "pending_review") {
      return NextResponse.json({
        success: true,
        pendingReview: true,
        reviewTaskId: review.taskId,
        confidence: review.confidence,
        message: "Low confidence — queued for operator review before posting.",
        ocrResult,
      });
    }

    if (parsed.data.autoCreate) {
      const invoice = await createInvoiceFromOCR(userId, ocrResult);
      return NextResponse.json({
        success: true,
        message: "Invoice created from OCR",
        invoice,
        ocrResult,
        confidence: review.confidence,
      });
    }

    return NextResponse.json({
      success: true,
      message: "OCR processed. Review and confirm to create invoice.",
      ocrResult,
      confidence: review.confidence,
    });
  } catch (err) {
    console.error("OCR endpoint error:", err);
    return NextResponse.json({ error: "OCR processing failed" }, { status: 500 });
  }
}
