export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export type CursorPageArgs = {
  take?: number;
  cursor?: { id: string } | null;
};

/** Clamp page size for list endpoints and Prisma `take`. */
export function clampPageSize(raw: number | undefined): number {
  if (raw == null || Number.isNaN(raw)) return DEFAULT_PAGE_SIZE;
  return Math.min(Math.max(1, Math.floor(raw)), MAX_PAGE_SIZE);
}

/** Standard stable order helper for cursor pagination on `id`. */
export function orderByIdAsc(): { id: "asc" } {
  return { id: "asc" };
}
