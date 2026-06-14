import { format, parseISO } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  PUBLIC_CHANGELOG_RELEASES,
  type PublicChangelogMaturity,
} from "@/lib/marketing/public-changelog-p3-87-content";

const MATURITY_VARIANT: Record<
  PublicChangelogMaturity,
  "default" | "secondary" | "outline"
> = {
  LIVE: "default",
  BETA: "secondary",
  PREVIEW: "outline",
};

export function PublicChangelogEntries() {
  return (
    <div data-testid="public-changelog" className="space-y-8">
      {PUBLIC_CHANGELOG_RELEASES.map((release) => (
        <article
          key={release.id}
          data-testid={`changelog-release-${release.id}`}
          className="border-b border-border/60 pb-8 last:border-0"
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {release.version} · {format(parseISO(release.publishedAt), "MMM d, yyyy")}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight">{release.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{release.summary}</p>
          <ul className="mt-4 space-y-3">
            {release.items.map((item) => (
              <li
                key={item.id}
                data-testid={`changelog-item-${item.id}`}
                className="rounded-xl border border-border/60 bg-muted/10 px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{item.label}</span>
                  <Badge
                    variant={MATURITY_VARIANT[item.maturity]}
                    data-testid={`changelog-maturity-${item.maturity.toLowerCase()}`}
                    className="text-[10px] uppercase tracking-wide"
                  >
                    {item.maturity}
                  </Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
