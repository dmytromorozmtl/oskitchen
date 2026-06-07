import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import type * as React from "react";

import { ErrorStateIllustration } from "@/components/feedback/error-state-illustration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ERROR_STATE_CARD_CLASS,
  ERROR_STATE_TEST_ID,
} from "@/lib/design/error-state-patterns";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Something went wrong",
  description,
  retryLabel,
  onRetry,
  homeHref = "/dashboard",
  homeLabel = "Back to dashboard",
  className,
  icon: Icon = AlertTriangle,
  showIllustration = true,
  showIcon = false,
}: {
  title?: string;
  description: React.ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
  homeHref?: string;
  homeLabel?: string;
  className?: string;
  icon?: LucideIcon;
  showIllustration?: boolean;
  showIcon?: boolean;
}) {
  return (
    <Card
      role="alert"
      className={cn(ERROR_STATE_CARD_CLASS, "max-w-lg shadow-none", className)}
      data-testid={ERROR_STATE_TEST_ID}
    >
      <CardHeader className="items-center text-center sm:items-start sm:text-left">
        {showIllustration ? <ErrorStateIllustration className="mb-2 sm:mx-0" /> : null}
        <div className="flex w-full items-start gap-3">
          {showIcon ? (
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-destructive dark:text-destructive/90" aria-hidden />
          ) : null}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap justify-center gap-2 sm:justify-start">
        {retryLabel && onRetry ? (
          <Button type="button" variant="secondary" className="rounded-full" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        <Button asChild variant="outline" className="rounded-full">
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
