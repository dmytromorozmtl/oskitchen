import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function BillingSuccessPage(props: {
  searchParams: Promise<{ plan?: string; session_id?: string }>;
}) {
  const params = await props.searchParams;
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Checkout completed</CardTitle>
          <CardDescription>
            {params.plan ? `You're upgrading to ${params.plan}.` : "Your subscription has been updated."}
            {" "}Stripe will deliver a webhook in a few seconds; refresh to see the new status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild><Link href="/dashboard/billing">Back to billing</Link></Button>
          <Button asChild variant="outline"><Link href="/dashboard/billing/invoices">View invoices</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
