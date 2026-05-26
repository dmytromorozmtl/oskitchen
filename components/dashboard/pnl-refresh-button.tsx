"use client";

import { getActionError } from "@/lib/action-result";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { refreshPnlSnapshotAction } from "@/actions/accounting/pnl";
import { Button } from "@/components/ui/button";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

export function PnlRefreshButton({ period }: { period: PnlPeriod }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-xl gap-2"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await refreshPnlSnapshotAction(period);
          const _err = getActionError(result); if (_err) { toast.error(_err);
            return;
          }
          toast.success("P&L snapshot refreshed");
          router.refresh();
        });
      }}
    >
      <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} />
      {pending ? "Refreshing…" : "Refresh P&L"}
    </Button>
  );
}
