export const STOREFRONT_ADMIN_PAGE_SIZE = 50;

export function parseAdminPageParam(raw: string | undefined): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export function adminPagination(total: number, page: number, pageSize = STOREFRONT_ADMIN_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  return {
    page: safePage,
    totalPages,
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  };
}
