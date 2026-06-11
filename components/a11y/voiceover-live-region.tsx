import { cn } from "@/lib/utils";

type VoiceoverLiveRegionProps = {
  message: string;
  testId: string;
  politeness?: "polite" | "assertive";
  className?: string;
};

/** Screen-reader live region for VoiceOver / NVDA announcements (P1-68). */
export function VoiceoverLiveRegion({
  message,
  testId,
  politeness = "polite",
  className,
}: VoiceoverLiveRegionProps) {
  if (!message) return null;

  return (
    <p
      className={cn("sr-only", className)}
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      data-testid={testId}
    >
      {message}
    </p>
  );
}
