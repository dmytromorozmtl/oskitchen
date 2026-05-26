"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  DEFAULT_CATERING_FORM_FIELDS,
  DEFAULT_CONTACT_FORM_FIELDS,
  storefrontFormFieldsSchema,
} from "@/lib/storefront/forms";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import {
  archiveStorefrontFormCascade,
  createStorefrontFormRecord,
  findStorefrontFormForMerchant,
  getStorefrontIdForUser,
  linkStorefrontPublicForms,
  markStorefrontFormSubmissionRead,
  updateStorefrontFormRecord,
} from "@/services/storefront/storefront-form-service";
import { submitPublicStorefrontFormFromFd } from "@/services/storefront/storefront-form-submission-service";

async function storefrontRow(userId: string) {
  return getStorefrontIdForUser(userId);
}

const kindSchema = z.enum([
  "CONTACT",
  "CATERING",
  "CUSTOM",
  "WHOLESALE_INQUIRY",
  "EVENT_INQUIRY",
  "FEEDBACK",
  "CUSTOM_REQUEST",
]);

export async function createStorefrontFormAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const sf = await storefrontRow(user.id);
    if (!sf) return { error: "Save storefront overview first." };
    const title = String(formData.get("title") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const kind = kindSchema.safeParse(String(formData.get("formKind") ?? ""));
    const fieldsRaw = String(formData.get("fieldsJson") ?? "").trim();
    if (!title || !slug) return { error: "Title and slug are required." };
    if (!kind.success) return { error: "Invalid form type." };
    let fieldsJson: unknown;
    if (fieldsRaw) {
      try {
        fieldsJson = JSON.parse(fieldsRaw) as unknown;
      } catch {
        return { error: "Fields must be valid JSON." };
      }
    } else {
      fieldsJson = kind.data === "CATERING" ? DEFAULT_CATERING_FORM_FIELDS : DEFAULT_CONTACT_FORM_FIELDS;
    }
    const parsed = storefrontFormFieldsSchema.safeParse(fieldsJson);
    if (!parsed.success) return { error: "Each field needs id, type, and label." };
    await createStorefrontFormRecord({
      storefrontId: sf.id,
      slug,
      title,
      formKind: kind.data,
      fieldsJson: parsed.data,
    });
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/forms");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontFormAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const sf = await storefrontRow(user.id);
    if (!sf) return { error: "Storefront not found." };
    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title") ?? "").trim();
    const fieldsRaw = String(formData.get("fieldsJson") ?? "").trim();
    const active = formData.get("active") === "on";
    const archived = formData.get("archived") === "on";
    if (!id) return { error: "Missing id." };
    const row = await findStorefrontFormForMerchant(id, sf.id);
    if (!row) return { error: "Form not found." };
    let fieldsJson: unknown;
    try {
      fieldsJson = JSON.parse(fieldsRaw || "[]") as unknown;
    } catch {
      return { error: "Fields must be valid JSON." };
    }
    const parsed = storefrontFormFieldsSchema.safeParse(fieldsJson);
    if (!parsed.success) return { error: "Invalid fields." };
    await updateStorefrontFormRecord({
      id,
      storefrontId: sf.id,
      title: title || row.title,
      fieldsJson: parsed.data,
      active,
      archived,
    });
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/forms");
    revalidatePath(`/dashboard/storefront/forms/${id}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function linkStorefrontFormsAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const contactId = String(formData.get("publicContactFormId") ?? "").trim() || null;
    const cateringId = String(formData.get("publicCateringFormId") ?? "").trim() || null;
    const sf = await getStorefrontIdForUser(user.id);
    if (!sf) return { error: "Storefront not found." };
    const res = await linkStorefrontPublicForms({
      storefrontId: sf.id,
      publicContactFormId: contactId,
      publicCateringFormId: cateringId,
    });
    if ("error" in res) return { error: res.error };
    revalidateStorefrontDashboardAndPublic(res.storeSlug);
    revalidatePath("/dashboard/storefront/forms");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function markFormSubmissionReadAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const sf = await storefrontRow(user.id);
    if (!sf) return { error: "Storefront not found." };
    const sid = String(formData.get("submissionId") ?? "");
    if (!sid) return { error: "Missing submission." };
    const res = await markStorefrontFormSubmissionRead({ submissionId: sid, storefrontId: sf.id });
    if ("error" in res) return { error: res.error };
    revalidatePath(`/dashboard/storefront/forms/${res.formId}/submissions`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function archiveStorefrontFormAction(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const sf = await storefrontRow(user.id);
    if (!sf) return { error: "Storefront not found." };
    const id = String(formData.get("id") ?? "");
    if (!id) return { error: "Missing form." };
    const row = await findStorefrontFormForMerchant(id, sf.id);
    if (!row) return { error: "Form not found." };
    await archiveStorefrontFormCascade({ formId: id, storefrontId: sf.id });
    revalidateStorefrontDashboardAndPublic(sf.storeSlug);
    revalidatePath("/dashboard/storefront/forms");
    revalidatePath(`/dashboard/storefront/forms/${id}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function submitPublicStorefrontForm(raw: FormData | Record<string, unknown>) {
  try {
    const fd = raw instanceof FormData ? raw : null;
    if (!fd) return { error: "Invalid submission." };
    const res = await submitPublicStorefrontFormFromFd(fd);
    if ("error" in res) return res;
    revalidatePath(`/s/${res.storeSlug}`);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function submitPublicStorefrontFormFormAction(formData: FormData): Promise<void> {
  void (await submitPublicStorefrontForm(formData));
}

export async function createStorefrontFormFormAction(formData: FormData): Promise<void> {
  void (await createStorefrontFormAction(formData));
}

export async function updateStorefrontFormFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontFormAction(formData));
}

export async function linkStorefrontFormsFormAction(formData: FormData): Promise<void> {
  void (await linkStorefrontFormsAction(formData));
}

export async function archiveStorefrontFormFormAction(formData: FormData): Promise<void> {
  void (await archiveStorefrontFormAction(formData));
}

export async function markFormSubmissionReadFormAction(formData: FormData): Promise<void> {
  void (await markFormSubmissionReadAction(formData));
}
