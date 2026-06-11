import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingCheckoutCancelledPage(props: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const params = await props.searchParams;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Checkout cancelled</CardTitle>
          <CardDescription>
            {params.plan ? `You did not complete the ${params.plan} checkout.` : "No subscription change was made."} You can try again anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild><Link href="/dashboard/billing/plans">Pick a plan</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/billing">Back to billing</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
