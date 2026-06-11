import { cn } from "@/lib/utils";
import { layout } from "@/lib/design-tokens";
import { DESIGN_TOKEN_PAGE_SHELL_PADDING_CLASS } from "@/lib/design/design-token-pass-policy";

export function PageShell({
  children,
  className,
  narrow,
}: {
  children: React.ReactNode;
  className?: string;
  /** Use for wizard-style flows */
  narrow?: boolean;
}) {
  return (
    <div
      className={cn(
        DESIGN_TOKEN_PAGE_SHELL_PADDING_CLASS,
        narrow ? "max-w-3xl" : layout.contentMaxClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
