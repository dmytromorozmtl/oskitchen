import type { StorefrontFormKind } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { parseStorefrontFormFieldsJson } from "@/lib/storefront/forms";
import { uploadStorefrontFormAttachment } from "@/services/storefront/storefront-form-upload-service";

function conversionEventNameForFormKind(kind: StorefrontFormKind): string {
  switch (kind) {
    case "CATERING":
      return "catering_inquiry_submit";
    case "CONTACT":
      return "contact_submit";
    case "WHOLESALE_INQUIRY":
      return "wholesale_inquiry_submit";
    case "EVENT_INQUIRY":
      return "event_inquiry_submit";
    case "FEEDBACK":
      return "feedback_submit";
    case "CUSTOM_REQUEST":
      return "custom_request_submit";
    default:
      return "storefront_form_submit";
  }
}

export async function submitPublicStorefrontFormFromFd(
  fd: FormData,
): Promise<{ ok: true; storeSlug: string } | { error: string }> {
  const formId = String(fd.get("formId") ?? "");
  const storeSlug = String(fd.get("storeSlug") ?? "").trim();
  const hpName = String(fd.get("hpName") ?? "");
  const hpVal = String(fd.get(hpName) ?? "");
  if (!formId || !storeSlug) return { error: "Invalid form." };
  if (hpVal.trim()) return { error: "Submission rejected." };

  const form = await prisma.storefrontForm.findFirst({
    where: { id: formId, active: true, archived: false, storefront: { storeSlug, enabled: true, published: true } },
    include: { storefront: true },
  });
  if (!form) return { error: "Form not available." };

  const parsedFields = parseStorefrontFormFieldsJson(form.fieldsJson);
  if (parsedFields.error || !parsedFields.fields.length) return { error: "Form is misconfigured." };

  const payload: Record<string, unknown> = {};
  const fileAttachments: {
    fieldId: string;
    url: string;
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }[] = [];

  for (const f of parsedFields.fields) {
    if (f.type === "hidden") {
      payload[f.id] = f.defaultValue ?? "";
      continue;
    }
    const v = fd.get(f.id);
    if (f.type === "file") {
      if (!(v instanceof File) || v.size === 0) {
        if (f.required) return { error: `Please attach: ${f.label}` };
        payload[f.id] = "";
        continue;
      }
      const bytes = new Uint8Array(await v.arrayBuffer());
      const uploaded = await uploadStorefrontFormAttachment({
        storeSlug,
        formId: form.id,
        fieldId: f.id,
        fileName: v.name,
        contentType: v.type || "application/octet-stream",
        bytes,
      });
      if (!uploaded.ok) return { error: uploaded.error };
      fileAttachments.push({
        fieldId: f.id,
        url: uploaded.url,
        fileName: uploaded.fileName,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
      });
      payload[f.id] = uploaded.url;
      continue;
    }
    if (f.type === "checkbox" || f.type === "consent_checkbox") {
      payload[f.id] = v === "on" || v === "true";
    } else {
      payload[f.id] = typeof v === "string" ? v : "";
    }
    if (f.type === "consent_checkbox") {
      const val = payload[f.id];
      if (val !== true) return { error: `Please accept: ${f.label}` };
    } else if (f.required) {
      const val = payload[f.id];
      if (val === "" || val === false) return { error: `Please fill in: ${f.label}` };
    }
  }

  const recent = await prisma.storefrontFormSubmission.count({
    where: {
      formId: form.id,
      createdAt: { gte: new Date(Date.now() - 60_000) },
    },
  });
  if (recent > 20) return { error: "Too many submissions — try again in a minute." };

  await prisma.storefrontFormSubmission.create({
    data: {
      formId: form.id,
      payloadJson: {
        ...payload,
        _meta: {
          storeSlug,
          files: fileAttachments.length ? fileAttachments : undefined,
        },
      },
      status: "NEW",
    },
  });

  const to = (form.notificationEmail ?? form.storefront.contactEmail)?.trim();
  if (to) {
    const { sendRawEmail } = await import("@/lib/email");
    await sendRawEmail({
      to,
      subject: `New ${form.formKind} — ${form.storefront.publicName}`,
      text: Object.entries(payload)
        .filter(([k]) => !k.startsWith("_"))
        .map(([k, v]) => `${k}: ${String(v)}`)
        .join("\n"),
    });
  }

  const eventName = conversionEventNameForFormKind(form.formKind);
  await prisma.storefrontConversionEvent.create({
    data: {
      storefrontId: form.storefrontId,
      eventName,
      metadataJson: { formId: form.id },
    },
  });

  return { ok: true, storeSlug };
}
