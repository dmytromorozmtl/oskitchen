/**
 * Display-only wrapper for redacted error previews (server or client).
 */
export function SensitiveErrorPreview({
  text,
  redacted,
  className,
  textClassName,
}: {
  text: string | null | undefined;
  redacted: boolean;
  className?: string;
  /** e.g. text-destructive vs text-zinc-400 */
  textClassName?: string;
}) {
  if (text == null || text === "" || text === "—") return null;
  return (
    <div className={className}>
      <p className={textClassName ?? "text-xs text-destructive"}>{text}</p>
      {redacted ? (
        <p className="mt-0.5 text-[10px] italic text-muted-foreground">Sensitive details redacted</p>
      ) : null}
    </div>
  );
}
