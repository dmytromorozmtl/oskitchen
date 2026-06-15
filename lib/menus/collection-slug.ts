import { prisma } from "@/lib/prisma";

/** URL segment for /collections/{slug} — lowercase alphanumeric + hyphens. */
export function slugifyCollectionSlug(input: string): string | null {
  const s = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return s.length >= 2 ? s : null;
}

const RESERVED = new Set([
  "menu",
  "cart",
  "checkout",
  "admin",
  "api",
  "collections",
  "products",
  "order",
  "p",
  "policies",
]);

export function validateCollectionSlugFormat(raw: string): { ok: true; slug: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: true, slug: "" };
  const slug = slugifyCollectionSlug(trimmed);
  if (!slug) return { ok: false, error: "Collection URL must be at least 2 characters (letters, numbers, hyphens)." };
  if (RESERVED.has(slug)) return { ok: false, error: "That collection URL is reserved — choose another slug." };
  return { ok: true, slug };
}

export async function assertCollectionSlugUnique(
  userId: string,
  slug: string | null,
  excludeMenuId?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!slug) return { ok: true };
  const clash = await prisma.menu.findFirst({
    where: {
      userId,
      collectionSlug: slug,
      ...(excludeMenuId ? { NOT: { id: excludeMenuId } } : {}),
    },
    select: { id: true, title: true },
  });
  if (clash) {
    return { ok: false, error: `Another menu already uses collection URL “${slug}” (${clash.title}).` };
  }
  return { ok: true };
}
