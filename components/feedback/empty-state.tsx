import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <Icon className="mb-4 h-10 w-10 text-muted-foreground" aria-hidden />
      ) : null}
      <p className="text-base font-medium">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Button asChild className="mt-6 rounded-full">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {actionLabel && onAction ? (
        <Button type="button" className="mt-6 rounded-full" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
