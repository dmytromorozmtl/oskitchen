import type { ReactNode } from "react";

import { PAGE_SECTION_TITLE_CLASS } from "@/lib/design/page-section-patterns";
import { cn } from "@/lib/utils";

export function PageSection({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)} data-testid="page-section">
      {title ? (
        <div
          className={cn(
            actions ? "flex flex-wrap items-end justify-between gap-3" : undefined,
          )}
        >
          <div>
            <h2 className={PAGE_SECTION_TITLE_CLASS}>{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {actions ?? null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
