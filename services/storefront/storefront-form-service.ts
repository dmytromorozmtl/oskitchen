import type { StorefrontFormKind } from "@prisma/client";

import { requireManageStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CATERING_FORM_FIELDS,
  DEFAULT_CONTACT_FORM_FIELDS,
  type StorefrontFormField,
} from "@/lib/storefront/forms";

export async function createStorefrontFormRecord(input: {
  storefrontId: string;
  title: string;
  slug: string;
  formKind: StorefrontFormKind;
  fieldsJson: StorefrontFormField[];
}) {
  return prisma.storefrontForm.create({
    data: {
      storefrontId: input.storefrontId,
      slug: input.slug,
      title: input.title,
      formKind: input.formKind,
      fieldsJson: input.fieldsJson,
      honeypotName: `hp_${input.slug.slice(0, 8)}`,
    },
  });
}

export async function updateStorefrontFormRecord(input: {
  id: string;
  storefrontId: string;
  title: string;
  fieldsJson: StorefrontFormField[];
  active: boolean;
  archived: boolean;
}) {
  return prisma.storefrontForm.update({
    where: { id: input.id },
    data: {
      title: input.title,
      fieldsJson: input.fieldsJson,
      active: input.active,
      archived: input.archived,
    },
  });
}

export async function linkStorefrontPublicForms(input: {
  storefrontId: string;
  publicContactFormId: string | null;
  publicCateringFormId: string | null;
}) {
  const sf = await prisma.storefrontSettings.findUnique({ where: { id: input.storefrontId } });
  if (!sf) return { error: "Storefront not found." as const };
  if (input.publicContactFormId) {
    const ok = await prisma.storefrontForm.findFirst({ where: { id: input.publicContactFormId, storefrontId: sf.id } });
    if (!ok) return { error: "Contact form not found." as const };
  }
  if (input.publicCateringFormId) {
    const ok = await prisma.storefrontForm.findFirst({ where: { id: input.publicCateringFormId, storefrontId: sf.id } });
    if (!ok) return { error: "Catering form not found." as const };
  }
  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: { publicContactFormId: input.publicContactFormId, publicCateringFormId: input.publicCateringFormId },
  });
  return { ok: true as const, storeSlug: sf.storeSlug };
}

export async function markStorefrontFormSubmissionRead(input: { submissionId: string; storefrontId: string }) {
  const sub = await prisma.storefrontFormSubmission.findFirst({
    where: { id: input.submissionId, form: { storefrontId: input.storefrontId } },
  });
  if (!sub) return { error: "Not found." as const };
  await prisma.storefrontFormSubmission.update({
    where: { id: input.submissionId },
    data: { status: "READ", readAt: new Date() },
  });
  return { ok: true as const, formId: sub.formId };
}

export async function archiveStorefrontFormCascade(input: { formId: string; storefrontId: string }) {
  await prisma.$transaction([
    prisma.storefrontSettings.updateMany({
      where: { publicContactFormId: input.formId },
      data: { publicContactFormId: null },
    }),
    prisma.storefrontSettings.updateMany({
      where: { publicCateringFormId: input.formId },
      data: { publicCateringFormId: null },
    }),
    prisma.storefrontPage.updateMany({
      where: { linkedFormId: input.formId },
      data: { linkedFormId: null },
    }),
    prisma.storefrontForm.update({
      where: { id: input.formId },
      data: { archived: true, active: false },
    }),
  ]);
}

export async function findStorefrontFormForMerchant(formId: string, storefrontId: string) {
  return prisma.storefrontForm.findFirst({ where: { id: formId, storefrontId } });
}

export type ManageStorefrontRef = { id: string; storeSlug: string };

/** Active storefront for manage-gated form mutations (cookie-aware, canonical `storefront.manage`). */
export async function getManageStorefrontForSession(
  operation: string,
): Promise<ManageStorefrontRef | { error: string }> {
  try {
    const { sf } = await requireManageStorefrontRow(
      { id: true, storeSlug: true },
      { operation },
    );
    return sf;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Storefront not available.";
    return { error: msg };
  }
}

/**
 * @deprecated Prefer {@link getManageStorefrontForSession} so manage RBAC and operation audits stay explicit.
 */
export async function getStorefrontIdForUser(
  _sessionUserId: string,
  operation = "storefront.forms.resolve",
) {
  const res = await getManageStorefrontForSession(operation);
  return "error" in res ? null : res;
}

export { DEFAULT_CATERING_FORM_FIELDS, DEFAULT_CONTACT_FORM_FIELDS };
export type { StorefrontFormField };
