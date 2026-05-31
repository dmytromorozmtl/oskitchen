import { Suspense } from "react";

import PartnerEmbedDemoClient from "./embed-demo-client";

export const metadata = { title: "Partner embed demo" };

export default function PartnerEmbedDemoPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-12 text-sm text-muted-foreground">Loading embed demo…</div>
      }
    >
      <PartnerEmbedDemoClient />
    </Suspense>
  );
}
