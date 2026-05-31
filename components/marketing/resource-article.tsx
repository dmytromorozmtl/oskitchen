import Link from "next/link";

import { PublicShell } from "@/components/marketing/public-page";
import { Button } from "@/components/ui/button";
import { resourcePages } from "@/lib/public-copy";

export function ResourceArticle({ slug }: { slug: keyof typeof resourcePages }) {
  const title = resourcePages[slug];
  return (
    <PublicShell>
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Kitchen operations guide</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A practical guide for food businesses evaluating operational systems after orders arrive.
          </p>
        </div>
        {[
          "Most growing food businesses start with a sales channel and a spreadsheet. That works until weekly order volume, menu changes, customer notes, and fulfillment timing start competing for attention.",
          "A strong operating system should separate sales from fulfillment. Shopify, WooCommerce, Google Forms, Square exports, and manual lists can remain the order source while OS Kitchen becomes the production and packing control layer.",
          "The first implementation step is clean data: products, customers, order history, weekly menus, and fulfillment rules. Import previews and product mapping reduce launch risk before live production data changes.",
          "The second step is staff alignment. Kitchen staff need production quantities, packing staff need labels and exceptions, managers need order hub visibility, and owners need reports.",
          "The safest rollout is a test production day. Use staged orders, confirm mappings, print sample labels, review route manifests, and document blockers before launch.",
          "OS Kitchen is designed to centralize these workflows without claiming to replace sales channels, legal review, tax advice, nutrition verification, or marketplace approval.",
        ].map((p) => (
          <p key={p} className="leading-7 text-muted-foreground">{p}</p>
        ))}
        <div className="rounded-2xl border bg-muted/30 p-5">
          <h2 className="font-semibold">Next step</h2>
          <p className="mt-2 text-sm text-muted-foreground">Book a demo to review your current order flow and implementation risks.</p>
          <Button asChild className="mt-4" variant="premium">
            <Link href="/book-demo">Book demo</Link>
          </Button>
        </div>
      </main>
    </PublicShell>
  );
}
