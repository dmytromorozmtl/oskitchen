import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";

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
  className,
  icon: Icon = AlertTriangle,
}: {
  title?: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
  homeHref?: string;
  className?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card
      className={cn(ERROR_STATE_CARD_CLASS, className)}
      data-testid={ERROR_STATE_TEST_ID}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 text-destructive" aria-hidden />
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-base text-muted-foreground">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {retryLabel && onRetry ? (
          <Button type="button" variant="secondary" className="rounded-full" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        <Button asChild variant="outline" className="rounded-full">
          <Link href={homeHref}>Back to dashboard</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
