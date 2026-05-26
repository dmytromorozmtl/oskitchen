import type { Metadata } from "next";

import { SalesDeckPrint } from "@/components/marketing/sales-deck-print";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";

export const metadata: Metadata = {
  ...marketingPageMetadata({
    title: "KitchenOS Sales Deck",
    description: "Print-ready sales deck for demos, pilots, and investor intros.",
    path: "/deck",
    noIndex: true,
  }),
};

export default function SalesDeckPage() {
  return <SalesDeckPrint />;
}
