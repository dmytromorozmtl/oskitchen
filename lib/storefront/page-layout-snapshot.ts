import type { StorefrontSection, StorefrontSectionType } from "@prisma/client";

import { asJsonRecord } from "@/lib/prisma/json";

export type PublishedSectionSnapshot = {
  id: string;
  type: StorefrontSectionType;
  sortOrder: number;
  visible: boolean;
  contentJson: unknown;
};

export type PageLayoutMeta = {
  layoutPublishedAt?: string | null;
  publishedSections?: PublishedSectionSnapshot[];
};

export function parsePageLayoutMeta(contentJson: unknown): PageLayoutMeta {
  const j = asJsonRecord(contentJson);
  if (!j) return {};
  const publishedSections = Array.isArray(j.publishedSections)
    ? (j.publishedSections as PublishedSectionSnapshot[])
    : undefined;
  const layoutPublishedAt =
    typeof j.layoutPublishedAt === "string" ? j.layoutPublishedAt : null;
  return { layoutPublishedAt, publishedSections };
}

export function buildPublishedSectionSnapshots(
  sections: Pick<StorefrontSection, "id" | "type" | "sortOrder" | "visible" | "contentJson">[],
): PublishedSectionSnapshot[] {
  return sections.map((s) => ({
    id: s.id,
    type: s.type,
    sortOrder: s.sortOrder,
    visible: s.visible,
    contentJson: s.contentJson,
  }));
}

export function snapshotsToStorefrontSections(
  snapshots: PublishedSectionSnapshot[],
  pageId: string,
): StorefrontSection[] {
  const now = new Date();
  return snapshots.map((s) => ({
    id: s.id,
    pageId,
    type: s.type,
    sortOrder: s.sortOrder,
    visible: s.visible,
    contentJson: s.contentJson as StorefrontSection["contentJson"],
    createdAt: now,
    updatedAt: now,
  }));
}

export function mergePageLayoutMeta(
  contentJson: unknown,
  patch: Partial<PageLayoutMeta>,
): Record<string, unknown> {
  const base = asJsonRecord(contentJson) ?? {};
  return { ...base, ...patch };
}

export function layoutDraftDiffersFromPublished(
  draftSections: Pick<StorefrontSection, "id" | "type" | "sortOrder" | "visible">[],
  meta: PageLayoutMeta,
): boolean {
  const published = meta.publishedSections;
  if (!published?.length) return draftSections.length > 0;
  if (published.length !== draftSections.length) return true;
  const draftKey = draftSections
    .map((s) => `${s.id}:${s.type}:${s.sortOrder}:${s.visible}`)
    .join("|");
  const pubKey = published
    .map((s) => `${s.id}:${s.type}:${s.sortOrder}:${s.visible}`)
    .join("|");
  return draftKey !== pubKey;
}
