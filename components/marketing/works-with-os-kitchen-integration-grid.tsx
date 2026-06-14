import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  groupWorksWithIntegrationsByCategory,
  WORKS_WITH_OS_KITCHEN_CATEGORY_LABELS,
  WORKS_WITH_OS_KITCHEN_HONESTY_NOTE,
  WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS,
  WORKS_WITH_OS_KITCHEN_SUBTITLE,
} from "@/lib/marketing/works-with-os-kitchen-p2-57-content";
import { WORKS_WITH_OS_KITCHEN_P2_57_GRID_TEST_ID } from "@/lib/marketing/works-with-os-kitchen-p2-57-policy";

/** P2-57 — 17 LIVE integration tiles with brand logos and registry status. */
export function WorksWithOsKitchenIntegrationGrid() {
  const grouped = groupWorksWithIntegrationsByCategory();

  return (
    <div data-testid={WORKS_WITH_OS_KITCHEN_P2_57_GRID_TEST_ID}>
      <p className="mx-auto max-w-3xl text-center text-lg text-muted-foreground">
        {WORKS_WITH_OS_KITCHEN_SUBTITLE}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Badge variant="default" className="rounded-full px-3 py-1">
          {WORKS_WITH_OS_KITCHEN_LIVE_INTEGRATIONS.length} LIVE in registry
        </Badge>
        <Badge variant="outline" className="rounded-full px-3 py-1">
          Status from integration-registry.ts
        </Badge>
      </div>

      <div className="mt-12 space-y-12">
        {(Object.keys(grouped) as Array<keyof typeof grouped>).map((category) => {
          const cards = grouped[category];
          if (cards.length === 0) return null;
          return (
            <section key={category} aria-labelledby={`works-with-${category}`}>
              <h2
                id={`works-with-${category}`}
                className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                {WORKS_WITH_OS_KITCHEN_CATEGORY_LABELS[category]}
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {cards.map((card) => (
                  <li
                    key={card.id}
                    className="flex flex-col rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30"
                    data-testid={`works-with-integration-${card.id}`}
                  >
                    <div className="flex items-start gap-3">
                      <Image
                        src={card.logoPath}
                        alt={card.logoAlt}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">{card.name}</h3>
                          <Badge
                            variant="default"
                            className="rounded-full bg-emerald-600 text-[10px] uppercase hover:bg-emerald-600"
                          >
                            {card.status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {card.capability}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={card.setupRoute}
                      className="mt-4 text-xs font-medium text-primary hover:underline"
                    >
                      Setup in dashboard →
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">{WORKS_WITH_OS_KITCHEN_HONESTY_NOTE}</p>
    </div>
  );
}
