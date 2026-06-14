import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LOYALTY_PROGRAM_LIVE_P2_73_FULL_CHAIN,
  LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID,
} from "@/lib/loyalty/loyalty-program-live-p2-73-policy";

export function LoyaltyProgramLivePanel() {
  return (
    <Card data-testid="loyalty-program-live-panel" className="border-emerald-500/30 bg-emerald-500/5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Earn/redeem LIVE</CardTitle>
          <Badge className="rounded-full bg-emerald-600 hover:bg-emerald-600">LIVE</Badge>
        </div>
        <CardDescription>
          Full loyalty program — POS terminal and storefront checkout earn on order, redeem at
          checkout, CRM balance sync.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
        <div
          className="rounded-lg border border-border/80 bg-background/80 p-3"
          data-testid="loyalty-program-live-pos-channel"
        >
          <p className="font-medium">POS channel</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>Earn after sale (`earnLoyaltyPointsForOrder`)</li>
            <li>Redeem at checkout (`pos-loyalty-redeem-input`)</li>
            <li>Balance in payment panel</li>
          </ul>
        </div>
        <div
          className="rounded-lg border border-border/80 bg-background/80 p-3"
          data-testid="loyalty-program-live-storefront-channel"
        >
          <p className="font-medium">Storefront channel</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>Earn on paid order</li>
            <li>Apply points at checkout (`storefront-loyalty-redeem`)</li>
            <li>Balance via `/api/storefront/loyalty/balance`</li>
          </ul>
        </div>
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          Policy {LOYALTY_PROGRAM_LIVE_P2_73_POLICY_ID} · Chain:{" "}
          {LOYALTY_PROGRAM_LIVE_P2_73_FULL_CHAIN.join(" → ")}
        </p>
      </CardContent>
    </Card>
  );
}
