"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OrderHubExportButton({ storefrontOnly = false }: { storefrontOnly?: boolean }) {
  const href = storefrontOnly
    ? "/api/dashboard/orders/storefront-export?storefrontOnly=1"
    : "/api/dashboard/orders/storefront-export";

  return (
    <Button asChild variant="outline" size="sm" className="rounded-full">
      <a href={href} download>
        <Download className="mr-2 h-4 w-4" aria-hidden />
        Export CSV{storefrontOnly ? " (storefront)" : ""}
      </a>
    </Button>
  );
}
