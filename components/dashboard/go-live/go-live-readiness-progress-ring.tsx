import { cn } from "@/lib/utils";
import type { GoLiveReadinessProgressTone } from "@/lib/go-live/go-live-command-center-focus-era18";

const TONE_CLASS: Record<GoLiveReadinessProgressTone, string> = {
  urgent: "text-amber-600 dark:text-amber-400",
  caution: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
};

export function GoLiveReadinessProgressRing(props: {
  score: number;
  tone: GoLiveReadinessProgressTone;
}) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, props.score));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex h-16 w-16 shrink-0 items-center justify-center"
      data-testid="go-live-readiness-progress-ring"
      role="img"
      aria-label={`${clamped}% launch readiness`}
    >
      <svg className="absolute inset-0 h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden>
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth="6"
        />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(TONE_CLASS[props.tone])}
        />
      </svg>
      <span className={cn("text-sm font-semibold tabular-nums", TONE_CLASS[props.tone])}>
        {clamped}%
      </span>
    </div>
  );
}
