import { cn } from "@/lib/utils";
import { layout } from "@/lib/design-tokens";

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
        "mx-auto w-full px-0",
        narrow ? "max-w-3xl" : layout.contentMaxClass,
        className,
      )}
    >
      {children}
    </div>
  );
}
