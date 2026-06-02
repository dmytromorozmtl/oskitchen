import {
  ApiErrorState,
  formatApiErrorMessage,
  type ApiErrorStateProps,
} from "@/components/ui/api-error-state";

export type AiFeatureApiErrorProps = {
  featureName: string;
  error: unknown;
  fallbackMessage?: string;
} & Pick<
  ApiErrorStateProps,
  "variant" | "onRetry" | "retryLabel" | "statusCode" | "requestId" | "className" | "data-testid"
>;

export function AiFeatureApiError({
  featureName,
  error,
  fallbackMessage = "We couldn't load this AI feature. Your data is safe — try again or contact support.",
  variant = "card",
  onRetry,
  retryLabel,
  statusCode,
  requestId,
  className,
  "data-testid": testId = "ai-feature-api-error",
}: AiFeatureApiErrorProps) {
  return (
    <ApiErrorState
      title={`Couldn't load ${featureName}`}
      message={formatApiErrorMessage(error, fallbackMessage)}
      variant={variant}
      onRetry={onRetry}
      retryLabel={retryLabel}
      statusCode={statusCode}
      requestId={requestId}
      homeHref="/dashboard/today"
      homeLabel="Go to Today"
      supportHref="/dashboard/support"
      className={className}
      data-testid={testId}
    />
  );
}
