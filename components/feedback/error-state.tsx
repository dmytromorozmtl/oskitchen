import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import type * as React from "react";

import { ErrorStateIllustration } from "@/components/feedback/error-state-illustration";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ERROR_TEMPLATE_ACTIONS_CLASS,
  ERROR_TEMPLATE_CARD_CLASS,
  ERROR_TEMPLATE_DESCRIPTION_CLASS,
  ERROR_TEMPLATE_HOME_BUTTON_CLASS,
  ERROR_TEMPLATE_RETRY_BUTTON_CLASS,
  ERROR_TEMPLATE_TITLE_CLASS,
  ERROR_STATE_TEST_ID,
} from "@/lib/design/error-template-design-tokens-policy";
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
      className={cn(ERROR_TEMPLATE_CARD_CLASS, "max-w-lg shadow-none", className)}
      data-testid={ERROR_STATE_TEST_ID}
    >
      <CardHeader className="items-center text-center sm:items-start sm:text-left">
        {showIllustration ? <ErrorStateIllustration className="mb-2 sm:mx-0" /> : null}
        <div className="flex w-full items-start gap-3">
          {showIcon ? (
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-destructive dark:text-destructive/90" aria-hidden />
          ) : null}
          <div className="min-w-0 flex-1">
            <CardTitle className={ERROR_TEMPLATE_TITLE_CLASS}>{title}</CardTitle>
            <CardDescription className={ERROR_TEMPLATE_DESCRIPTION_CLASS}>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className={ERROR_TEMPLATE_ACTIONS_CLASS}>
        {retryLabel && onRetry ? (
          <Button type="button" variant="secondary" className={ERROR_TEMPLATE_RETRY_BUTTON_CLASS} onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
        <Button asChild variant="outline" className={ERROR_TEMPLATE_HOME_BUTTON_CLASS}>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
