import Link from "next/link";

import {
  resolveImportJobRowNextAction,
  type ImportJobFocusRow,
} from "@/lib/import-center/import-center-focus-era18";

export function ImportJobRowNextAction(props: { job: ImportJobFocusRow }) {
  const action = resolveImportJobRowNextAction(props.job);

  if (!action) {
    return null;
  }

  return (
    <Link
      href={action.href}
      data-testid={`import-job-next-action-${props.job.id}`}
      className={
        action.tone === "urgent"
          ? "text-xs font-medium text-amber-800 underline-offset-2 hover:underline dark:text-amber-200"
          : "text-xs font-medium text-primary underline-offset-2 hover:underline"
      }
    >
      {action.label}
    </Link>
  );
}
