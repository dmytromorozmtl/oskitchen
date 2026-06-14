function buildPublicLayoutErrorSource(homeHref: string, homeLabel: string): string {
  return `"use client";

import { PublicLayoutError } from "@/components/marketing/public-layout-error";

export default function Error(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PublicLayoutError
      {...props}
      homeHref="${homeHref}"
      homeLabel="${homeLabel}"
    />
  );
}
`;
}

export { buildPublicLayoutErrorSource };
