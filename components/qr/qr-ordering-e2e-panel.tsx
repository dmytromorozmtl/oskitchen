import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  QR_ORDERING_E2E_P2_74_FULL_CHAIN,
  QR_ORDERING_E2E_P2_74_POLICY_ID,
} from "@/lib/qr/qr-ordering-e2e-p2-74-policy";

export function QrOrderingE2EPanel() {
  return (
    <Card data-testid="qr-ordering-e2e-panel" className="border-sky-500/30 bg-sky-500/5">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">QR ordering E2E — scan to KDS</CardTitle>
          <Badge className="rounded-full bg-sky-600 hover:bg-sky-600">LIVE</Badge>
        </div>
        <CardDescription>
          Guest scans table QR → orders from phone → WebhookEvent → KitchenTask → KDS ticket with
          table badge.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
        <div
          className="rounded-lg border border-border/80 bg-background/80 p-3"
          data-testid="qr-ordering-e2e-scan-channel"
        >
          <p className="font-medium">Scan + checkout</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>Deep link `/q/{slug}/{table}`</li>
            <li>Guest menu (`qr-ordering-page`)</li>
            <li>POST `/api/public/qr-order`</li>
          </ul>
        </div>
        <div
          className="rounded-lg border border-border/80 bg-background/80 p-3"
          data-testid="qr-ordering-e2e-kds-channel"
        >
          <p className="font-medium">Kitchen + KDS</p>
          <ul className="mt-2 list-inside list-disc text-muted-foreground">
            <li>`order.created` outbound webhook</li>
            <li>KitchenTask linked to order</li>
            <li>KDS ticket + table badge</li>
          </ul>
        </div>
        <p className="sm:col-span-2 text-xs text-muted-foreground">
          Policy {QR_ORDERING_E2E_P2_74_POLICY_ID} · Chain:{" "}
          {QR_ORDERING_E2E_P2_74_FULL_CHAIN.join(" → ")}
        </p>
      </CardContent>
    </Card>
  );
}
