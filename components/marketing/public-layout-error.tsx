"use client";

import type { ReactNode } from "react";

import { ErrorBoundaryTemplate } from "@/components/dashboard/error-boundary-template";

type PublicLayoutErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
  title?: string;
  description?: ReactNode;
};

/** Layout-level public route error boundary — retry + segment home CTA. */
export function PublicLayoutError({
  error,
  reset,
  homeHref = "/",
  homeLabel = "Home",
  title,
  description,
}: PublicLayoutErrorProps) {
  return (
    <ErrorBoundaryTemplate
      error={error}
      reset={reset}
      homeHref={homeHref}
      homeLabel={homeLabel}
      title={title}
      description={description}
    />
  );
}
