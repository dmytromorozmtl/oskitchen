import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { channelByKey } from "@/lib/channels/channel-registry";

const REDIRECT: Record<string, string> = {
  woocommerce: "/dashboard/integrations/woocommerce",
  shopify: "/dashboard/integrations/shopify",
  "uber-eats": "/dashboard/integrations/uber-eats",
  "uber-direct": "/dashboard/integrations/uber-direct",
  doordash: "/dashboard/integrations/doordash",
  grubhub: "/dashboard/integrations/grubhub",
  "kitchenos-storefront": "/dashboard/storefront",
  "manual-orders": "/dashboard/orders/quick",
  "csv-import": "/dashboard/import-center",
  "catering-inquiries": "/dashboard/catering",
  "bar-event-inquiries": "/dashboard/catering",
  "bakery-preorder": "/dashboard/storefront",
  "cafe-pickup": "/dashboard/storefront",
};

export default async function ChannelSetupPage({
  params,
}: {
  params: Promise<{ providerKey: string }>;
}) {
  const { providerKey } = await params;
  const target = REDIRECT[providerKey];
  if (target) redirect(target);

  const def = channelByKey(providerKey);
  if (!def || !def.isPlaceholder) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Badge variant="outline" className="rounded-full">
          {def.statusType.replace(/_/g, " ")}
        </Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{def.label}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{def.longDescription}</p>
      </div>
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-base">Honest status</CardTitle>
          <CardDescription>
            KitchenOS does not ship a live certified connector for this provider yet. This page
            documents requirements and captures intent — no credentials are validated here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Capabilities (roadmap):</span>{" "}
            {def.capabilities.join(", ")}
          </p>
          {def.envRequirements.length > 0 ? (
            <p>
              <span className="font-medium text-foreground">Typical requirements:</span>{" "}
              {def.envRequirements.join("; ")}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button asChild className="rounded-full">
              <Link href="/contact-sales">Request integration</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link href="/dashboard/sales-channels">Back to channels</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
