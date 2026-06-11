"use client";

import type { ReactNode } from "react";

import { RouteError } from "@/components/dashboard/route-states";
import {
  ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID,
  ERROR_TEMPLATE_TEST_ID,
} from "@/lib/design/error-template-design-tokens-policy";

type ErrorBoundaryTemplateProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: ReactNode;
  homeHref?: string;
  homeLabel?: string;
};

/** Standard Next.js route error boundary — illustration, retry, dark mode via RouteError. */
export function ErrorBoundaryTemplate({
  error,
  reset,
  title,
  description,
  homeHref,
  homeLabel,
}: ErrorBoundaryTemplateProps) {
  return (
    <div data-testid={ERROR_TEMPLATE_TEST_ID} data-error-template-policy={ERROR_TEMPLATE_DESIGN_TOKENS_POLICY_ID}>
      <RouteError
        error={error}
        reset={reset}
        title={title}
        description={description}
        homeHref={homeHref}
        homeLabel={homeLabel}
      />
    </div>
  );
}

export default ErrorBoundaryTemplate;
