import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PaginationBar({
  basePath,
  page,
  totalPages,
  query = {},
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | number | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") params.set(k, String(v));
    }
    if (p > 1) params.set("page", String(p));
    const q = params.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-sm text-muted-foreground">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm" className="rounded-full" disabled={page <= 1}>
          <Link href={page <= 1 ? "#" : href(page - 1)} aria-disabled={page <= 1}>
            Previous
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="rounded-full" disabled={page >= totalPages}>
          <Link href={page >= totalPages ? "#" : href(page + 1)} aria-disabled={page >= totalPages}>
            Next
          </Link>
        </Button>
      </div>
    </div>
  );
}
