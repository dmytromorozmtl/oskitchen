"use client";

import { PublicLayoutError } from "@/components/marketing/public-layout-error";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicLayoutError
      {...props}
      homeHref="/platform/dashboard"
      homeLabel="Platform home"
    />
  );
}
