import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  formatCustomerContactSubtitle,
  formatCustomerPrimaryLabel,
  hasMarketableEmail,
} from "@/lib/customers/customer-display";

export function OrderCustomerSummary({
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  kitchenCustomerId,
}: {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  kitchenCustomerId: string | null;
}) {
  const primary = formatCustomerPrimaryLabel({ customerName, customerEmail });
  const subtitle = formatCustomerContactSubtitle({ customerEmail, customerPhone });
  const canEmail = hasMarketableEmail(customerEmail);

  return (
    <div className="space-y-2">
      <p className="text-lg font-medium leading-snug">{primary}</p>
      {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button asChild variant="outline" size="sm" className="rounded-full">
          <Link href={`/dashboard/orders/${orderId}?tab=customer`}>Customer & CRM</Link>
        </Button>
        {!kitchenCustomerId ? (
          <span className="self-center text-xs text-muted-foreground">Guest checkout — CRM link optional.</span>
        ) : null}
        {!canEmail ? (
          <span className="self-center text-xs text-muted-foreground">Add a real email to send marketing or receipts.</span>
        ) : null}
      </div>
    </div>
  );
}
