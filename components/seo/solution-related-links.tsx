import Link from "next/link";

import type { SolutionPageSlug } from "@/lib/demo-verticals";

const LINKS: Array<{ slug: SolutionPageSlug; label: string }> = [
  { slug: "restaurants", label: "Restaurant POS" },
  { slug: "bars", label: "Bar POS & tabs" },
  { slug: "cafes", label: "Café POS" },
  { slug: "meal-prep", label: "Meal prep software" },
  { slug: "ghost-kitchens", label: "Ghost kitchens" },
  { slug: "catering", label: "Catering management" },
  { slug: "bakeries", label: "Bakery operations" },
];

export function SolutionRelatedLinks({ currentSlug }: { currentSlug: SolutionPageSlug }) {
  const others = LINKS.filter((l) => l.slug !== currentSlug);

  return (
    <section className="mt-16 border-t pt-8">
      <h2 className="text-xl font-semibold tracking-tight">Explore more solutions</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        KitchenOS adapts to weekly meal prep, catering drops, and bakery preorders from one workspace.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {others.map((link) => (
          <Link
            key={link.slug}
            href={`/solutions/${link.slug}`}
            className="rounded-lg border border-border/80 p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
          >
            <span className="font-medium text-foreground">{link.label}</span>
            <span className="mt-1 block text-sm text-muted-foreground">View solution →</span>
          </Link>
        ))}
        <Link
          href="/demo"
          className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-4 transition-colors hover:border-primary/50"
        >
          <span className="font-medium text-foreground">Interactive demo</span>
          <span className="mt-1 block text-sm text-muted-foreground">Try a live workspace →</span>
        </Link>
      </div>
    </section>
  );
}
