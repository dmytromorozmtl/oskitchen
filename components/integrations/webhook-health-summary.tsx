import Link from "next/link";

export function WebhookHealthSummary({
  pendingUnprocessed,
  failedUnprocessed,
  variant = "workspace",
}: {
  pendingUnprocessed: number;
  failedUnprocessed: number;
  variant?: "workspace" | "platform";
}) {
  const isPlatform = variant === "platform";
  return (
    <div
      className={
        isPlatform
          ? "rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-200"
          : "rounded-xl border border-border/70 bg-muted/30 p-4 text-sm"
      }
    >
      <h3 className={isPlatform ? "font-semibold text-white" : "font-semibold"}>Webhook health (aggregate)</h3>
      <p className={isPlatform ? "mt-2 text-xs text-zinc-400" : "mt-2 text-xs text-muted-foreground"}>
        Counts are cross-tenant on the platform view. Payloads and secrets are never listed here.
      </p>
      <dl className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between gap-2">
          <dt className={isPlatform ? "text-zinc-500" : "text-muted-foreground"}>Unprocessed</dt>
          <dd className="font-mono tabular-nums">{pendingUnprocessed}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className={isPlatform ? "text-zinc-500" : "text-muted-foreground"}>Unprocessed with error string</dt>
          <dd className="font-mono tabular-nums">{failedUnprocessed}</dd>
        </div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        <Link href={isPlatform ? "/platform/error-recovery" : "/dashboard/error-recovery"} className="underline-offset-4 hover:underline">
          Error recovery
        </Link>
        {!isPlatform ? (
          <Link href="/dashboard/sales-channels/webhooks" className="underline-offset-4 hover:underline">
            Workspace webhooks
          </Link>
        ) : null}
      </div>
    </div>
  );
}
