import Link from "next/link";

import { SOLUTION_GUIDE_LINKS } from "@/lib/marketing/blog-related";
import type { SolutionPageSlug } from "@/lib/demo-verticals";

export function SolutionGuideLinks({ slug }: { slug: SolutionPageSlug }) {
  const guides = SOLUTION_GUIDE_LINKS[slug];
  if (!guides?.length) return null;

  return (
    <section className="border-t border-border/60 py-12">
      <h2 className="text-xl font-semibold tracking-tight">Operator guides</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Playbooks and calculators connected to this workflow — submit new URLs in Search Console after
        publishing.
      </p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <li key={g.href}>
            <Link
              href={g.href}
              className="flex h-full flex-col rounded-xl border border-border/80 p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
            >
              <span className="font-medium text-foreground">{g.title}</span>
              <span className="mt-2 flex-1 text-sm text-muted-foreground leading-relaxed">
                {g.description}
              </span>
              <span className="mt-3 text-xs font-medium text-primary">Read guide →</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
