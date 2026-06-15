import Link from "next/link";

import { buildBreadcrumbJsonLd } from "@/lib/storefront/seo";

export type BreadcrumbItem = { label: string; href?: string };

export function StorefrontBreadcrumbs({
  items,
  jsonLdBase,
}: {
  items: BreadcrumbItem[];
  jsonLdBase?: { name: string; url: string }[];
}) {
  if (items.length === 0) return null;

  const ld =
    jsonLdBase && jsonLdBase.length > 0
      ? buildBreadcrumbJsonLd(jsonLdBase)
      : null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      {ld ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ) : null}
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {item.href ? (
              <Link href={item.href} className="text-primary underline-offset-4 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
