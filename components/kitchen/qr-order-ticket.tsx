import { isQrTableOrder, readQrTableLabel } from "@/lib/qr/qr-order-meta";
import { cn } from "@/lib/utils";

export function QrOrderTicketBadge({
  tableName,
  sourceMetadataJson,
  className,
}: {
  tableName?: string | null;
  sourceMetadataJson?: unknown;
  className?: string;
}) {
  const qr = isQrTableOrder(sourceMetadataJson);
  const label = tableName?.trim() || readQrTableLabel(sourceMetadataJson);
  if (!label) return null;

  return (
    <span
      data-testid="kds-qr-table-badge"
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        qr
          ? "bg-sky-600 text-white shadow-sm"
          : "border bg-background font-semibold text-foreground shadow-sm",
        className,
      )}
    >
      {label}
    </span>
  );
}
