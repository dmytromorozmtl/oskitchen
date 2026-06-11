import {
  ERROR_STATE_ILLUSTRATION_TEST_ID,
} from "@/lib/design/error-state-patterns";
import { ERROR_TEMPLATE_ILLUSTRATION_CLASS } from "@/lib/design/error-template-design-tokens-policy";
import { cn } from "@/lib/utils";

export function ErrorStateIllustration({ className }: { className?: string }) {
  return (
    <svg
      data-testid={ERROR_STATE_ILLUSTRATION_TEST_ID}
      viewBox="0 0 120 96"
      role="img"
      aria-hidden
      className={cn(ERROR_TEMPLATE_ILLUSTRATION_CLASS, className)}
    >
      <title>Error</title>
      <rect
        x="8"
        y="52"
        width="104"
        height="36"
        rx="8"
        fill="currentColor"
        fillOpacity="0.08"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <path
        d="M24 68h72M36 80h48"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="60" cy="28" r="18" fill="currentColor" fillOpacity="0.12" />
      <path
        d="M60 18v12M60 34v2"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M48 28h24"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
