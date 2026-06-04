import Link from "next/link";
import type { ReactNode } from "react";

import {
  FILTER_CHIP_ACTIVE_CLASS,
  FILTER_CHIP_BASE_CLASS,
  FILTER_CHIP_INACTIVE_CLASS,
  FILTER_SEARCH_BAR_TEST_ID,
  FILTER_SEARCH_SHELL_CLASS,
} from "@/lib/design/filter-search-patterns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FilterSearchShell({
  title = "Filters",
  description,
  children,
  className,
  printHidden,
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  printHidden?: boolean;
}) {
  return (
    <Card
      className={cn(FILTER_SEARCH_SHELL_CLASS, printHidden ? "print:hidden" : undefined, className)}
      data-testid={FILTER_SEARCH_BAR_TEST_ID}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? (
          typeof description === "string" ? (
            <CardDescription className="text-xs">{description}</CardDescription>
          ) : (
            description
          )
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function FilterChipLink({
  href,
  active,
  children,
  className,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        FILTER_CHIP_BASE_CLASS,
        active ? FILTER_CHIP_ACTIVE_CLASS : FILTER_CHIP_INACTIVE_CLASS,
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function FilterChipRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap gap-1.5", className)}>{children}</div>;
}
