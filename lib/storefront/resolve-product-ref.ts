const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ProductRefMatch = {
  id: string;
  publicSlug?: string | null;
};

export function findProductByPublicRef<T extends ProductRefMatch>(products: T[], ref: string): T | null {
  const raw = ref.trim();
  if (!raw) return null;
  if (UUID_RE.test(raw)) {
    return products.find((p) => p.id === raw) ?? null;
  }
  const slug = raw.toLowerCase();
  return products.find((p) => p.publicSlug?.toLowerCase() === slug) ?? null;
}

export function productUrlSegment(p: ProductRefMatch): string {
  const s = p.publicSlug?.trim();
  if (s) return s;
  return p.id;
}
