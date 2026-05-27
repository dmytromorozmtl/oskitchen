import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceStorefrontRouteRateLimit } from "@/lib/storefront/storefront-rate-limit";
import { prisma } from "@/lib/prisma";
import { validateStorefrontFormAttachmentUpload } from "@/lib/upload-policy/media-upload-validation";
import { uploadStorefrontFormAttachment } from "@/services/storefront/storefront-form-upload-service";

export async function POST(request: Request) {
  const rl = await enforceStorefrontRouteRateLimit(request, "forms-upload");
  if (!rl.ok) {
    return NextResponse.json(
      { error: rl.message },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
      },
    );
  }

  const fd = await request.formData().catch(() => null);
  if (!fd) return NextResponse.json({ error: "Invalid form data." }, { status: 400 });

  const metaSchema = z.object({
    storeSlug: z.string().min(1).max(100),
    formId: z.string().min(1).max(100),
    fieldId: z.string().min(1).max(100),
  });

  const meta = metaSchema.safeParse({
    storeSlug: String(fd.get("storeSlug") ?? "").trim(),
    formId: String(fd.get("formId") ?? "").trim(),
    fieldId: String(fd.get("fieldId") ?? "").trim(),
  });
  if (!meta.success) {
    return NextResponse.json({ error: "Invalid upload metadata." }, { status: 400 });
  }

  const file = fd.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  const { storeSlug, formId, fieldId } = meta.data;

  const form = await prisma.storefrontForm.findFirst({
    where: {
      id: formId,
      active: true,
      archived: false,
      storefront: { storeSlug, enabled: true, published: true },
    },
    select: { id: true },
  });
  if (!form) return NextResponse.json({ error: "Form not available." }, { status: 404 });

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const validated = validateStorefrontFormAttachmentUpload({
      bytes,
      mimeType: file.type || "",
    });
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const uploaded = await uploadStorefrontFormAttachment({
      storeSlug,
      formId,
      fieldId,
      fileName: file.name.slice(0, 255),
      contentType: validated.mimeType,
      bytes,
    });

    if (!uploaded.ok) {
      return NextResponse.json({ error: uploaded.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      url: uploaded.url,
      fileName: uploaded.fileName,
      contentType: uploaded.contentType,
      sizeBytes: uploaded.sizeBytes,
      virusScan: uploaded.scanned,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
