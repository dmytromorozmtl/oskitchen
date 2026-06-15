import {
  FORM_FEEDBACK_ERROR_TEST_ID,
  FORM_FEEDBACK_SUCCESS_TEST_ID,
} from "@/lib/design/form-feedback-patterns";
import { cn } from "@/lib/utils";

export function FormActionInlineFeedback({
  message,
  variant,
  className,
}: {
  message?: string | null;
  variant: "success" | "error";
  className?: string;
}) {
  if (!message) return null;

  return (
    <p
      className={cn(
        "text-xs",
        variant === "success" ? "text-emerald-600" : "text-destructive",
        className,
      )}
      data-testid={
        variant === "success" ? FORM_FEEDBACK_SUCCESS_TEST_ID : FORM_FEEDBACK_ERROR_TEST_ID
      }
      role={variant === "error" ? "alert" : "status"}
    >
      {message}
    </p>
  );
}
