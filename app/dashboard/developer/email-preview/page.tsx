import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import {
  deliveryReminderTemplate,
  orderConfirmationTemplate,
  orderReadyTemplate,
  pickupReminderTemplate,
  preorderReminderTemplate,
} from "@/lib/email/templates";

export default async function DeveloperEmailPreviewPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  await requireDeveloperCenterAccess();

  const itemsHtml = `<tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">Demo bowl</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;">2</td></tr>`;

  const previews = [
    {
      name: "Order confirmation",
      html: orderConfirmationTemplate({
        businessName: "Demo Kitchen",
        customerName: "Jordan",
        orderId: "demo-order",
        total: "$48.00",
        itemsHtml,
        lookupUrl: "https://example.com/order/demo",
        fulfillmentLabel: "Pickup",
        fulfillmentDate: "Saturday",
      }),
    },
    {
      name: "Order ready",
      html: orderReadyTemplate({
        businessName: "Demo Kitchen",
        customerName: "Jordan",
        instructions: "Pick up at the counter — bring your confirmation email.",
      }),
    },
    {
      name: "Pickup reminder",
      html: pickupReminderTemplate({
        businessName: "Demo Kitchen",
        customerName: "Jordan",
        when: "Tomorrow, 4–6pm",
        address: "123 Prep Lane",
      }),
    },
    {
      name: "Delivery reminder",
      html: deliveryReminderTemplate({
        businessName: "Demo Kitchen",
        customerName: "Jordan",
        when: "Tomorrow morning",
      }),
    },
    {
      name: "Preorder reminder",
      html: preorderReminderTemplate({
        businessName: "Demo Kitchen",
        customerName: "Jordan",
        deadline: "Thursday 9pm",
        ctaUrl: "https://example.com/menus",
      }),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          <Link href="/dashboard/developer" className="text-primary hover:underline">
            ← Developer
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Email preview</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Local development only — renders branded HTML shells with sample data. Nothing is
          sent. Production returns 404.
        </p>
      </div>

      <div className="space-y-10">
        {previews.map((p) => (
          <Card key={p.name} className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{p.name}</CardTitle>
              <CardDescription>HTML preview — iframe is isolated from the app shell.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[420px] w-full rounded-xl border border-border/80">
                <iframe
                  title={p.name}
                  srcDoc={p.html}
                  className="h-[400px] w-full bg-white"
                />
              </ScrollArea>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
