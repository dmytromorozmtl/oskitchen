export const DASHBOARD_ERROR_BOUNDARY_TEMPLATE_SOURCE = `"use client";

import { ErrorBoundaryTemplate } from "@/components/dashboard/error-boundary-template";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorBoundaryTemplate {...props} />;
}
`;
