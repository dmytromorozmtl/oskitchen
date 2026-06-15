import { Loader2 } from "lucide-react";

import { ROUTE_LOADING_TEST_ID } from "@/lib/design/route-loading-patterns";
import { cn } from "@/lib/utils";

export function LoadingState({
  title = "Loading…",
  className,
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-3 text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
      data-testid={ROUTE_LOADING_TEST_ID}
    >
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
      <p className="text-sm font-medium">{title}</p>
    </div>
  );
}
