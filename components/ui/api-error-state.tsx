import Link from "next/link";
import { AlertCircle, type LucideIcon } from "lucide-react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type ApiErrorStateProps = {
  title?: string;
  message: string;
  statusCode?: number | null;
  requestId?: string | null;
  onRetry?: () => void;
  retryLabel?: string;
  supportHref?: string;
  supportLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  icon?: LucideIcon;
  className?: string;
  variant?: "card" | "inline";
  "data-testid"?: string;
};

export function formatApiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (error instanceof Error && error.message.trim()) return error.message.trim();
  if (typeof error === "string" && error.trim()) return error.trim();
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message.trim();
  }
  return fallback;
}

function ApiErrorMeta({
  statusCode,
  requestId,
}: Pick<ApiErrorStateProps, "statusCode" | "requestId">) {
  if (statusCode == null && !requestId) return null;

  return (
    <p className="mt-2 text-xs text-muted-foreground">
      {statusCode != null ? <span>HTTP {statusCode}</span> : null}
      {statusCode != null && requestId ? <span aria-hidden> · </span> : null}
      {requestId ? <span>Ref {requestId}</span> : null}
    </p>
  );
}

function ApiErrorActions({
  onRetry,
  retryLabel = "Try again",
  supportHref = "/dashboard/support",
  supportLabel = "Contact support",
  homeHref = "/dashboard/today",
  homeLabel = "Go to Today",
}: Pick<
  ApiErrorStateProps,
  "onRetry" | "retryLabel" | "supportHref" | "supportLabel" | "homeHref" | "homeLabel"
> & { centered?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap",
        centered ? "sm:justify-center" : "sm:justify-start",
      )}
    >
      {onRetry ? (
        <Button type="button" variant="premium" className="rounded-full" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
      <Button asChild variant="outline" className="rounded-full">
        <Link href={supportHref}>{supportLabel}</Link>
      </Button>
      <Button asChild variant="ghost" className="rounded-full text-muted-foreground">
        <Link href={homeHref}>{homeLabel}</Link>
      </Button>
    </div>
  );
}

export function ApiErrorState({
  title = "Couldn’t load data",
  message,
  statusCode,
  requestId,
  onRetry,
  retryLabel,
  supportHref,
  supportLabel,
  homeHref,
  homeLabel,
  icon: Icon = AlertCircle,
  className,
  variant = "card",
  "data-testid": testId = "api-error-state",
}: ApiErrorStateProps) {
  if (variant === "inline") {
    return (
      <div
        role="alert"
        data-testid={testId}
        className={cn(
          "rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center",
          className,
        )}
      >
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <p className="text-base font-medium">{title}</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {message}
        </p>
        <ApiErrorMeta statusCode={statusCode} requestId={requestId} />
        <div className="mx-auto mt-4 max-w-md">
          <ApiErrorActions
            onRetry={onRetry}
            retryLabel={retryLabel}
            supportHref={supportHref}
            supportLabel={supportLabel}
            homeHref={homeHref}
            homeLabel={homeLabel}
            centered
          />
        </div>
      </div>
    );
  }

  return (
    <Card
      role="alert"
      data-testid={testId}
      className={cn("border-destructive/30 bg-destructive/5 shadow-none", className)}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <Icon className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription className="text-base leading-relaxed">{message}</CardDescription>
            <ApiErrorMeta statusCode={statusCode} requestId={requestId} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ApiErrorActions
          onRetry={onRetry}
          retryLabel={retryLabel}
          supportHref={supportHref}
          supportLabel={supportLabel}
          homeHref={homeHref}
          homeLabel={homeLabel}
        />
      </CardContent>
    </Card>
  );
}
