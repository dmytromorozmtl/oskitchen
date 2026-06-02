import { isVoiceOrder, readVoiceTableLabel } from "@/lib/voice/voice-order-meta";
import { cn } from "@/lib/utils";

export function VoiceOrderTicketBadge({
  tableName,
  sourceMetadataJson,
  className,
}: {
  tableName?: string | null;
  sourceMetadataJson?: unknown;
  className?: string;
}) {
  if (!isVoiceOrder(sourceMetadataJson)) return null;
  const label = tableName?.trim() || readVoiceTableLabel(sourceMetadataJson);
  return (
    <span
      data-testid="kds-voice-order-badge"
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-violet-600 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm",
        className,
      )}
    >
      <span>Voice</span>
      {label ? <span className="font-semibold normal-case tracking-normal">· {label}</span> : null}
    </span>
  );
}
