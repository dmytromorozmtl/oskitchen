import type { ReactNode } from "react";

type PermissionDeniedShellProps = {
  children: ReactNode;
  /** Optional surface id for data attribute auditing */
  surface?: string;
};

/** Consistent layout wrapper for RBAC denial cards on dashboard surfaces. */
export function PermissionDeniedShell({ children, surface }: PermissionDeniedShellProps) {
  return (
    <div
      className="mx-auto max-w-xl space-y-4 py-10"
      data-permission-denied-surface={surface ?? undefined}
    >
      {children}
    </div>
  );
}
