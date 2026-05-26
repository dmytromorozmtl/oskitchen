import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const packages = [
  ["Quick Start", "$499", "Business setup, first menu setup, basic training, one integration guidance session, and one-hour onboarding."],
  ["Growth Setup", "$1,499", "Data import, WooCommerce or Shopify setup, staff training, production workflow setup, and go-live checklist."],
  ["Team Launch", "$3,000+", "Multi-channel setup, import/mapping support, packing labels, first production day support, and custom workflow configuration."],
  ["Enterprise", "Custom", "Multi-location, custom integration, team onboarding, reporting setup, and dedicated support."],
] as const;

export default function ImplementationServicePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-6 py-16">
      <section className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">White-glove onboarding</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Launch KitchenOS without migration chaos.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          We help food businesses migrate spreadsheets, WooCommerce/Shopify exports, menus, products, customers,
          and first production workflows into KitchenOS safely.
        </p>
        <div className="mt-6 flex gap-3">
          <Button asChild size="lg">
            <Link href="/book-demo">Book implementation call</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/pricing">View software plans</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/beta">Apply for beta</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {packages.map(([name, price, description]) => (
          <Card key={name}>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{price}</CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-2xl border bg-muted/30 p-6">
        <h2 className="text-2xl font-semibold">What is included</h2>
        <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
          <p>Data import and error report review.</p>
          <p>Product/menu mapping against real sales channel SKUs.</p>
          <p>Staff training for kitchen, packing, manager, and owner roles.</p>
          <p>Go-live simulation and first production day support plan.</p>
        </div>
      </section>
    </main>
  );
}
