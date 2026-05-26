import type { ImportStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { IMPORT_STATUS_LABEL, IMPORT_STATUS_TONE } from "@/lib/import-center/import-status";

const TONE_CLASS: Record<string, string> = {
  neutral: "",
  info: "bg-sky-100 text-sky-700 hover:bg-sky-200",
  success: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  warning: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  danger: "bg-rose-100 text-rose-700 hover:bg-rose-200",
};

export function ImportStatusBadge({ status }: { status: ImportStatus }) {
  return <Badge className={TONE_CLASS[IMPORT_STATUS_TONE[status]]}>{IMPORT_STATUS_LABEL[status]}</Badge>;
}
