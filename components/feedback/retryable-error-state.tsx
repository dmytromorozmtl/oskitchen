import { ErrorState } from "@/components/feedback/error-state";

export function RetryableErrorState({
  description,
  onRetry,
}: {
  description: string;
  onRetry: () => void;
}) {
  return (
    <ErrorState
      title="We couldn’t complete that"
      description={description}
      retryLabel="Try again"
      onRetry={onRetry}
    />
  );
}
