import { ChannelSimulatorButtons } from "@/components/sales-channels/channel-simulator-buttons";

export default function ChannelSimulatorPage() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Channel simulator</h2>
        <p className="text-sm text-muted-foreground">
          Creates <span className="font-mono text-xs">TEST</span>-labeled import batches only — no
          live partner calls. Use it to train staff on staging, conflicts, and approvals.
        </p>
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
        Scenarios write deterministic rows into <span className="font-mono">channel_import_batches</span>{" "}
        for your tenant. They never touch storefront checkout or encrypted secrets.
      </div>
      <ChannelSimulatorButtons />
    </div>
  );
}
