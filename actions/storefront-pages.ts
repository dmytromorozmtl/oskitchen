"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, StorefrontPageType, StorefrontSectionType } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdminStorefrontRow } from "@/lib/storefront/require-admin-storefront";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { STOREFRONT_PERF } from "@/lib/storefront/performance-limits";
import {
  allEditorLocalesForStorefront,
  copyLocalizedPayloadToSecondaryLocales,
  ensureLocalizedEditorState,
  primaryLocaleForStorefront,
  secondaryLocalesForStorefront,
  upsertLocalizedSectionSlice,
} from "@/lib/storefront/localized-content";
import {
  ensurePageMetaState,
  mergeContentJsonPreservingBody,
  upsertPageMetaSlice,
} from "@/lib/storefront/localized-page-meta";
import { buildSectionsCreateInput, pageSectionTemplateForType } from "@/lib/storefront/page-section-templates";
import { resolveSectionPack, sectionPackToCreatePayload } from "@/lib/storefront/section-packs";
import { defaultSectionContent, normalizeSectionContent, normalizeSectionContentForLocale } from "@/lib/storefront/sections";
import { sanitizeRichTextLite } from "@/lib/storefront-builder/safe-content";
import { canStorefront } from "@/lib/storefront/storefront-permissions";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { auditStorefrontPagePublish } from "@/lib/storefront/storefront-audit";
import { dispatchStorefrontPagePublishedWebhook } from "@/lib/storefront/storefront-webhook";
import { getStorefrontPermissionSetForUser } from "@/services/storefront/storefront-permission-service";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

function revalidatePagePaths(storeSlug: string, pageSlug?: string) {
  revalidateStorefrontDashboardAndPublic(storeSlug);
  if (pageSlug) {
    revalidatePath(`/s/${storeSlug}/p/${pageSlug}`);
  }
}

const pageTypeEnum = z.nativeEnum(StorefrontPageType);

export async function createStorefrontPage(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to edit storefront pages." };
    }
    const title = (formData.get("title") ?? "").toString().trim();
    const slugRaw = (formData.get("slug") ?? "").toString();
    const pageTypeRaw = (formData.get("pageType") ?? "CUSTOM").toString();
    const pageTypeParse = pageTypeEnum.safeParse(pageTypeRaw);
    const pageType = pageTypeParse.success ? pageTypeParse.data : StorefrontPageType.CUSTOM;
    if (!title) return { error: "Title is required." };

    const { sf: sf } = await requireAdminStorefrontRow("storefront.settings", { id: true, storeSlug: true, workspaceId: true, userId: true });
    if (!sf) return { error: "Save storefront overview once before creating pages." };

    if (pageType === StorefrontPageType.HOME) {
      const home = await prisma.storefrontPage.findFirst({
        where: { storefrontId: sf.id, pageType: StorefrontPageType.HOME },
      });
      if (home) return { error: "A Home page already exists. Edit the existing Home page instead." };
    }

    const tpl = pageSectionTemplateForType(pageType);
    const slug =
      pageType === StorefrontPageType.HOME
        ? "home"
        : slugify(slugRaw || tpl.defaultSlug || title);
    if (!slug) return { error: "URL slug is invalid." };

    const clash = await prisma.storefrontPage.findFirst({
      where: { storefrontId: sf.id, slug },
    });
    if (clash) return { error: "That URL slug is already used on this storefront." };

    const maxSort = await prisma.storefrontPage.aggregate({
      where: { storefrontId: sf.id },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const page = await prisma.storefrontPage.create({
      data: {
        userId,
        storefrontId: sf.id,
        slug,
        title,
        pageType,
        contentJson: { body: "" },
        published: false,
        robotsNoindex: tpl.robotsNoindex ?? pageType === StorefrontPageType.THANK_YOU,
        sortOrder,
        sections: {
          create: buildSectionsCreateInput(pageType).map((s) => ({
            type: s.type,
            sortOrder: s.sortOrder,
            contentJson: s.contentJson as Prisma.InputJsonValue,
          })),
        },
      },
    });
    revalidatePagePaths(sf.storeSlug, page.slug);
    return { ok: true as const, pageId: page.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export type CreatePageFormState = { error?: string } | null;

export async function createStorefrontPageFormAction(
  _prev: CreatePageFormState,
  formData: FormData,
): Promise<CreatePageFormState> {
  const r = await createStorefrontPage(formData);
  if ("error" in r && r.error) return { error: r.error };
  if ("ok" in r && r.ok) {
    redirect(`/dashboard/storefront/pages/${r.pageId}`);
  }
  return { error: "Could not create page." };
}

export async function deleteStorefrontPage(formData: FormData) {
  const { sessionUser: user, userId } = await requireTenantActor();
  const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
  if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
    redirect("/dashboard/storefront/pages");
  }
  const pageId = (formData.get("pageId") ?? "").toString().trim();
  if (!/^[0-9a-f-]{36}$/i.test(pageId)) return;
  const page = await prisma.storefrontPage.findFirst({
    where: { id: pageId, userId },
    include: { storefront: { select: { storeSlug: true } } },
  });
  if (!page) return;
  if (page.pageType === StorefrontPageType.HOME) {
    redirect("/dashboard/storefront/pages");
    return;
  }
  await prisma.storefrontPage.delete({ where: { id: page.id } });
  revalidatePagePaths(page.storefront.storeSlug);
  redirect("/dashboard/storefront/pages");
}

const updatePageSchema = z.object({
  pageId: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(160),
  published: z.coerce.boolean(),
  seoTitle: z.string().max(255).optional().or(z.literal("")),
  seoDescription: z.string().max(4000).optional().or(z.literal("")),
  seoOgImageUrl: z.string().max(2000).optional().or(z.literal("")),
  pageBody: z.string().max(100000).optional().or(z.literal("")),
  linkedFormId: z.string().optional(),
  editLocale: z.string().max(8).optional(),
  defaultLocale: z.string().max(8).optional(),
  publishAt: z.string().max(40).optional().or(z.literal("")),
  robotsNoindex: z.coerce.boolean().optional(),
});

export async function updateStorefrontPageDetails(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to edit storefront pages." };
    }
    const parsed = updatePageSchema.safeParse({
      pageId: formData.get("pageId")?.toString(),
      title: formData.get("title")?.toString(),
      slug: formData.get("slug")?.toString(),
      published: formData.get("published") === "on",
      seoTitle: formData.get("seoTitle")?.toString(),
      seoDescription: formData.get("seoDescription")?.toString(),
      seoOgImageUrl: formData.get("seoOgImageUrl")?.toString(),
      pageBody: formData.get("pageBody")?.toString(),
      linkedFormId: formData.get("linkedFormId")?.toString(),
      editLocale: formData.get("editLocale")?.toString(),
      defaultLocale: formData.get("defaultLocale")?.toString(),
      publishAt: formData.get("publishAt")?.toString(),
      robotsNoindex: formData.get("robotsNoindex") === "on",
    });
    if (!parsed.success) return { error: "Check page fields." };
    const d = parsed.data;
    const page = await prisma.storefrontPage.findFirst({
      where: { id: d.pageId, userId },
      include: {
        storefront: {
          select: {
            id: true,
            storeSlug: true,
            locale: true,
            pagePublishWebhookUrl: true,
            pagePublishWebhookSecret: true,
          },
        },
      },
    });
    if (!page) return { error: "Page not found." };
    if (d.published && !canStorefront(permissions, "storefront:publish", { email })) {
      return { error: "You do not have permission to publish pages." };
    }
    const slug = page.pageType === StorefrontPageType.HOME ? "home" : slugify(d.slug);
    if (!slug) return { error: "URL slug is invalid." };
    if (slug !== page.slug) {
      const clash = await prisma.storefrontPage.findFirst({
        where: { storefrontId: page.storefrontId, slug, NOT: { id: page.id } },
      });
      if (clash) return { error: "That URL slug is already in use." };
    }
    const linkedRaw = (d.linkedFormId ?? "").trim();
    let linkedFormId: string | null = null;
    if (linkedRaw) {
      if (!z.string().uuid().safeParse(linkedRaw).success) {
        return { error: "Invalid linked form." };
      }
      const ok = await prisma.storefrontForm.findFirst({
        where: { id: linkedRaw, storefrontId: page.storefrontId, archived: false },
      });
      if (!ok) return { error: "Linked form not found for this storefront." };
      linkedFormId = linkedRaw;
    }
    const body = d.pageBody ?? "";
    const prevSlug = page.slug;
    const defaultLocale =
      d.defaultLocale?.trim() || primaryLocaleForStorefront(page.storefront.locale ?? "en");
    const editLocale = d.editLocale?.trim().split("-")[0]?.toLowerCase() || defaultLocale;

    const contentWithMeta = upsertPageMetaSlice(
      page.contentJson,
      editLocale,
      defaultLocale,
      {
        title: d.title.trim(),
        seoTitle: d.seoTitle?.trim() || "",
        seoDescription: d.seoDescription?.trim() || "",
        seoOgImageUrl: d.seoOgImageUrl?.trim() || "",
      },
      {
        title: page.title,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        seoOgImageUrl: null,
      },
    );
    const contentJson = mergeContentJsonPreservingBody(contentWithMeta, { body });

    const displayTitle =
      editLocale === defaultLocale ? d.title.trim() : page.title;

    const publishAtRaw = (d.publishAt ?? "").trim();
    let publishAt: Date | null = null;
    if (publishAtRaw) {
      const dt = new Date(publishAtRaw);
      if (Number.isNaN(dt.getTime())) return { error: "Invalid schedule date." };
      publishAt = dt;
    }
    const shouldPublishNow = Boolean(d.published || (publishAt != null && publishAt <= new Date()));

    await prisma.storefrontPage.update({
      where: { id: page.id },
      data: {
        title: displayTitle,
        slug,
        published: shouldPublishNow,
        publishAt,
        robotsNoindex: Boolean(d.robotsNoindex),
        seoTitle: editLocale === defaultLocale ? d.seoTitle?.trim() || null : page.seoTitle,
        seoDescription:
          editLocale === defaultLocale ? d.seoDescription?.trim() || null : page.seoDescription,
        contentJson: contentJson as Prisma.InputJsonValue,
        linkedFormId,
      },
    });
    if (shouldPublishNow !== page.published) {
      await auditStorefrontPagePublish({
        userId,
        email,
        pageId: page.id,
        pageTitle: displayTitle,
        storeSlug: page.storefront.storeSlug,
        published: Boolean(shouldPublishNow),
      });
      if (shouldPublishNow && page.storefront.pagePublishWebhookUrl) {
        void dispatchStorefrontPagePublishedWebhook({
          storefrontId: page.storefront.id,
          webhookUrl: page.storefront.pagePublishWebhookUrl,
          webhookSecret: page.storefront.pagePublishWebhookSecret,
          storeSlug: page.storefront.storeSlug,
          pageId: page.id,
          pageSlug: slug,
          pageTitle: displayTitle,
          publishedAt: new Date().toISOString(),
        });
      }
    }

    revalidatePath(`/dashboard/storefront/pages/${page.id}`);
    revalidatePagePaths(page.storefront.storeSlug, slug);
    if (slug !== prevSlug) {
      revalidatePath(`/s/${page.storefront.storeSlug}/p/${prevSlug}`);
    }
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontPageDetailsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontPageDetails(formData));
}

export async function addStorefrontSection(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to edit sections." };
    }
    const pageId = (formData.get("pageId") ?? "").toString().trim();
    const typeRaw = (formData.get("sectionType") ?? "TEXT_BLOCK").toString();
    const typeParse = z.nativeEnum(StorefrontSectionType).safeParse(typeRaw);
    const sectionType = typeParse.success ? typeParse.data : StorefrontSectionType.TEXT_BLOCK;
    if (!/^[0-9a-f-]{36}$/i.test(pageId)) return { error: "Invalid page." };

    const page = await prisma.storefrontPage.findFirst({
      where: { id: pageId, userId },
      include: { storefront: { select: { storeSlug: true } } },
    });
    if (!page) return { error: "Page not found." };

    const existing = await prisma.storefrontSection.count({ where: { pageId: page.id } });
    if (existing >= STOREFRONT_PERF.maxSectionsPerPage) {
      return { error: `This page already has the maximum of ${STOREFRONT_PERF.maxSectionsPerPage} sections.` };
    }

    const maxSort = await prisma.storefrontSection.aggregate({
      where: { pageId: page.id },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    await prisma.storefrontSection.create({
      data: {
        pageId: page.id,
        type: sectionType,
        sortOrder,
        contentJson: defaultSectionContent(sectionType) as Prisma.InputJsonValue,
      },
    });
    revalidatePath(`/dashboard/storefront/pages/${page.id}`);
    revalidatePagePaths(page.storefront.storeSlug, page.slug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function addStorefrontSectionFormAction(formData: FormData): Promise<void> {
  void (await addStorefrontSection(formData));
}

export async function duplicateStorefrontSection(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to edit sections." };
    }
    const sectionId = (formData.get("sectionId") ?? "").toString().trim();
    if (!/^[0-9a-f-]{36}$/i.test(sectionId)) return { error: "Invalid section." };

    const source = await prisma.storefrontSection.findFirst({
      where: { id: sectionId, page: { userId } },
      include: { page: { include: { storefront: { select: { storeSlug: true } } } } },
    });
    if (!source) return { error: "Section not found." };

    const count = await prisma.storefrontSection.count({ where: { pageId: source.pageId } });
    if (count >= STOREFRONT_PERF.maxSectionsPerPage) {
      return { error: `This page already has the maximum of ${STOREFRONT_PERF.maxSectionsPerPage} sections.` };
    }

    const maxSort = await prisma.storefrontSection.aggregate({
      where: { pageId: source.pageId },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    await prisma.storefrontSection.create({
      data: {
        pageId: source.pageId,
        type: source.type,
        sortOrder,
        contentJson: source.contentJson as Prisma.InputJsonValue,
        visible: source.visible,
      },
    });
    revalidatePath(`/dashboard/storefront/pages/${source.pageId}`);
    revalidatePagePaths(source.page.storefront.storeSlug, source.page.slug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function duplicateStorefrontSectionFormAction(formData: FormData): Promise<void> {
  void (await duplicateStorefrontSection(formData));
}

export async function addStorefrontSectionPack(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to edit sections." };
    }
    const pageId = (formData.get("pageId") ?? "").toString().trim();
    const packId = (formData.get("packId") ?? "").toString().trim();
    const pack = resolveSectionPack(packId);
    if (!pack) return { error: "Unknown section pack." };
    if (!/^[0-9a-f-]{36}$/i.test(pageId)) return { error: "Invalid page." };

    const page = await prisma.storefrontPage.findFirst({
      where: { id: pageId, userId },
      include: { storefront: { select: { storeSlug: true } } },
    });
    if (!page) return { error: "Page not found." };

    const existing = await prisma.storefrontSection.count({ where: { pageId: page.id } });
    const toAdd = sectionPackToCreatePayload(pack);
    if (existing + toAdd.length > STOREFRONT_PERF.maxSectionsPerPage) {
      return {
        error: `Adding this pack would exceed the maximum of ${STOREFRONT_PERF.maxSectionsPerPage} sections on a page.`,
      };
    }

    let sortOrder = (await prisma.storefrontSection.aggregate({ where: { pageId: page.id }, _max: { sortOrder: true } }))
      ._max.sortOrder ?? -1;

    for (const s of toAdd) {
      sortOrder += 1;
      await prisma.storefrontSection.create({
        data: {
          pageId: page.id,
          type: s.type,
          sortOrder,
          contentJson: s.contentJson as Prisma.InputJsonValue,
        },
      });
    }

    revalidatePath(`/dashboard/storefront/pages/${page.id}`);
    revalidatePagePaths(page.storefront.storeSlug, page.slug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function addStorefrontSectionPackFormAction(formData: FormData): Promise<void> {
  void (await addStorefrontSectionPack(formData));
}

export async function deleteStorefrontSection(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to edit sections." };
    }
    const sectionId = (formData.get("sectionId") ?? "").toString().trim();
    if (!/^[0-9a-f-]{36}$/i.test(sectionId)) return { error: "Invalid section." };

    const section = await prisma.storefrontSection.findFirst({
      where: { id: sectionId, page: { userId } },
      include: { page: { include: { storefront: { select: { storeSlug: true } } } } },
    });
    if (!section) return { error: "Section not found." };

    await prisma.storefrontSection.delete({ where: { id: section.id } });
    revalidatePath(`/dashboard/storefront/pages/${section.pageId}`);
    revalidatePagePaths(section.page.storefront.storeSlug, section.page.slug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteStorefrontSectionFormAction(formData: FormData): Promise<void> {
  void (await deleteStorefrontSection(formData));
}

export async function moveStorefrontSection(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to edit sections." };
    }
    const sectionId = (formData.get("sectionId") ?? "").toString().trim();
    const direction = (formData.get("direction") ?? "").toString();
    if (!/^[0-9a-f-]{36}$/i.test(sectionId)) return { error: "Invalid section." };
    if (direction !== "up" && direction !== "down") return { error: "Invalid direction." };

    const section = await prisma.storefrontSection.findFirst({
      where: { id: sectionId, page: { userId } },
      include: { page: { include: { storefront: { select: { storeSlug: true } } } } },
    });
    if (!section) return { error: "Section not found." };

    const siblings = await prisma.storefrontSection.findMany({
      where: { pageId: section.pageId },
      orderBy: { sortOrder: "asc" },
    });
    const idx = siblings.findIndex((s) => s.id === section.id);
    if (idx < 0) return { error: "Section not found." };
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= siblings.length) return { ok: true as const };

    const a = siblings[idx]!;
    const b = siblings[swapWith]!;
    await prisma.$transaction([
      prisma.storefrontSection.update({ where: { id: a.id }, data: { sortOrder: b.sortOrder } }),
      prisma.storefrontSection.update({ where: { id: b.id }, data: { sortOrder: a.sortOrder } }),
    ]);
    revalidatePath(`/dashboard/storefront/pages/${section.pageId}`);
    revalidatePagePaths(section.page.storefront.storeSlug, section.page.slug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function moveStorefrontSectionFormAction(formData: FormData): Promise<void> {
  void (await moveStorefrontSection(formData));
}

export async function updateStorefrontSectionJson(formData: FormData) {
  const { sessionUser: user, userId } = await requireTenantActor();
  const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
  if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
    return { error: "You do not have permission to edit sections." };
  }
  const sectionId = (formData.get("sectionId") ?? "").toString().trim();
  const rawJson = (formData.get("contentJson") ?? "").toString();
  if (!/^[0-9a-f-]{36}$/i.test(sectionId)) return { error: "Invalid section." };

  const section = await prisma.storefrontSection.findFirst({
    where: { id: sectionId, page: { userId } },
    include: { page: { include: { storefront: { select: { storeSlug: true } } } } },
  });
  if (!section) return { error: "Section not found." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson || "{}") as unknown;
  } catch {
    redirect(`/dashboard/storefront/pages/${section.pageId}?sectionError=json`);
  }
  const normalized = normalizeSectionContent(section.type, parsed);
  if (!normalized) {
    redirect(`/dashboard/storefront/pages/${section.pageId}?sectionError=schema`);
  }

  await prisma.storefrontSection.update({
    where: { id: section.id },
    data: { contentJson: normalized as Prisma.InputJsonValue },
  });
  revalidatePath(`/dashboard/storefront/pages/${section.pageId}`);
  revalidatePagePaths(section.page.storefront.storeSlug, section.page.slug);
  return { ok: true as const };
}

export async function updateStorefrontSectionJsonFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontSectionJson(formData));
}

/** Structured fields for HERO / TEXT_BLOCK / CTA — avoids raw JSON for common section types. */
export async function updateStorefrontSectionContent(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to edit sections." };
    }
    const sectionId = (formData.get("sectionId") ?? "").toString().trim();
    if (!/^[0-9a-f-]{36}$/i.test(sectionId)) return { error: "Invalid section." };

    const section = await prisma.storefrontSection.findFirst({
      where: { id: sectionId, page: { userId } },
      include: {
        page: {
          include: {
            storefront: { select: { storeSlug: true, locale: true } },
          },
        },
      },
    });
    if (!section) return { error: "Section not found." };

    const editLocale = (formData.get("editLocale") ?? "").toString().trim().split("-")[0]?.toLowerCase();
    const formDefaultLocale = (formData.get("defaultLocale") ?? "").toString().trim();
    const defaultLocale =
      formDefaultLocale || primaryLocaleForStorefront(section.page.storefront.locale ?? "en");

    const content: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (key === "sectionId" || key === "sectionType" || key === "editLocale" || key === "defaultLocale") continue;
      if (key === "faqCount" || key === "slideCount") continue;
      if (typeof value === "string" && !key.startsWith("faq_") && !key.startsWith("slide_")) {
        content[key] = value;
      }
    }

    if (section.type === StorefrontSectionType.FAQ) {
      const count = Number(formData.get("faqCount") ?? "1");
      const items: { q: string; a: string }[] = [];
      for (let i = 0; i < count; i++) {
        items.push({
          q: String(formData.get(`faq_q_${i}`) ?? ""),
          a: String(formData.get(`faq_a_${i}`) ?? ""),
        });
      }
      content.items = items;
    }

    if (section.type === StorefrontSectionType.SLIDER) {
      const existing = section.contentJson as { slides?: unknown[]; autoplay?: boolean; showDots?: boolean; showArrows?: boolean } | null;
      const prevSlides = Array.isArray(existing?.slides) ? existing!.slides : [];
      const count = Number(formData.get("slideCount") ?? "1");
      const slides: Record<string, unknown>[] = [];
      for (let i = 0; i < count; i++) {
        const prev = typeof prevSlides[i] === "object" && prevSlides[i] ? (prevSlides[i] as Record<string, unknown>) : {};
        slides.push({
          ...prev,
          title: String(formData.get(`slide_title_${i}`) ?? formData.get("slide_title") ?? ""),
          subtitle: String(formData.get(`slide_subtitle_${i}`) ?? formData.get("slide_subtitle") ?? ""),
          imageUrl: String(formData.get(`slide_imageUrl_${i}`) ?? formData.get("slide_imageUrl") ?? ""),
          altText: String(formData.get(`slide_altText_${i}`) ?? formData.get("slide_altText") ?? ""),
          ctaLabel: String(formData.get(`slide_ctaLabel_${i}`) ?? formData.get("slide_ctaLabel") ?? ""),
          ctaHref: String(formData.get(`slide_ctaHref_${i}`) ?? formData.get("slide_ctaHref") ?? ""),
          alignment: prev.alignment ?? "center",
        });
      }
      content.slides = slides.length > 0 ? slides : [{ title: "", alignment: "center" }];
      content.autoplay = existing?.autoplay ?? false;
      content.showDots = existing?.showDots ?? true;
      content.showArrows = existing?.showArrows ?? true;
    }

    if (section.type === StorefrontSectionType.TEXT_BLOCK) {
      if (typeof content.body === "string") {
        content.body = sanitizeRichTextLite(content.body);
      }
      const bf = formData.get("bodyFormat")?.toString();
      content.bodyFormat = bf === "markdown" ? "markdown" : "plain";
    }

    const locale = editLocale || defaultLocale;
    const normalizedSlice = normalizeSectionContentForLocale(section.type, content, locale, defaultLocale);
    if (!normalizedSlice) {
      redirect(`/dashboard/storefront/pages/${section.pageId}?sectionError=schema`);
    }

    const payload = upsertLocalizedSectionSlice(
      section.contentJson,
      locale,
      defaultLocale,
      normalizedSlice,
    );

    await prisma.storefrontSection.update({
      where: { id: section.id },
      data: { contentJson: payload as unknown as Prisma.InputJsonValue },
    });
    revalidatePath(`/dashboard/storefront/pages/${section.pageId}`);
    revalidatePagePaths(section.page.storefront.storeSlug, section.page.slug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontSectionContentFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontSectionContent(formData));
}

export async function deleteStorefrontPageFormAction(formData: FormData): Promise<void> {
  void (await deleteStorefrontPage(formData));
}

/** Copy primary locale section content into all secondary locales. */
export async function copyStorefrontSectionLocalesFormAction(formData: FormData): Promise<void> {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) return;

    const sectionId = (formData.get("sectionId") ?? "").toString().trim();
    const sourceLocale = (formData.get("sourceLocale") ?? "en").toString().split("-")[0]?.toLowerCase() ?? "en";
    if (!/^[0-9a-f-]{36}$/i.test(sectionId)) return;

    const section = await prisma.storefrontSection.findFirst({
      where: { id: sectionId, page: { userId } },
      include: { page: { include: { storefront: { select: { storeSlug: true, locale: true } } } } },
    });
    if (!section) return;

    const defaultLocale = primaryLocaleForStorefront(section.page.storefront.locale ?? "en");
    const secondary = secondaryLocalesForStorefront(defaultLocale);
    const payload = ensureLocalizedEditorState(section.contentJson, defaultLocale, secondary);
    const copied = copyLocalizedPayloadToSecondaryLocales(payload, sourceLocale, secondary);

    await prisma.storefrontSection.update({
      where: { id: section.id },
      data: { contentJson: copied as unknown as Prisma.InputJsonValue },
    });
    revalidatePath(`/dashboard/storefront/pages/${section.pageId}`);
    revalidatePagePaths(section.page.storefront.storeSlug, section.page.slug);
  } catch {
    /* silent */
  }
}

/** Copy primary locale page meta + all section locales on a page. */
export async function copyStorefrontPageLocalesFormAction(formData: FormData): Promise<void> {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) return;

    const pageId = (formData.get("pageId") ?? "").toString().trim();
    const sourceLocale = (formData.get("sourceLocale") ?? "en").toString().split("-")[0]?.toLowerCase() ?? "en";
    if (!/^[0-9a-f-]{36}$/i.test(pageId)) return;

    const page = await prisma.storefrontPage.findFirst({
      where: { id: pageId, userId },
      include: {
        sections: true,
        storefront: { select: { storeSlug: true, locale: true } },
      },
    });
    if (!page) return;

    const defaultLocale = primaryLocaleForStorefront(page.storefront.locale ?? "en");
    const secondary = secondaryLocalesForStorefront(defaultLocale);
    const { meta } = ensurePageMetaState(page.contentJson, defaultLocale, {
      title: page.title,
      seoTitle: page.seoTitle,
      seoDescription: page.seoDescription,
    });
    const copiedMeta = copyLocalizedPayloadToSecondaryLocales(meta, sourceLocale, secondary);
    const contentJson = mergeContentJsonPreservingBody(page.contentJson, { _pageMeta: copiedMeta } as Record<string, unknown>);

    for (const section of page.sections) {
      const sp = ensureLocalizedEditorState(section.contentJson, defaultLocale, secondary);
      const copied = copyLocalizedPayloadToSecondaryLocales(sp, sourceLocale, secondary);
      await prisma.storefrontSection.update({
        where: { id: section.id },
        data: { contentJson: copied as unknown as Prisma.InputJsonValue },
      });
    }

    await prisma.storefrontPage.update({
      where: { id: page.id },
      data: { contentJson: contentJson as Prisma.InputJsonValue },
    });
    revalidatePath(`/dashboard/storefront/pages/${page.id}`);
    revalidatePagePaths(page.storefront.storeSlug, page.slug);
  } catch {
    /* silent */
  }
}
