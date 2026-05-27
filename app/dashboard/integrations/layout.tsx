import React, { type ReactNode } from "react";

import { requireIntegrationsManagePage } from "@/lib/integrations/integrations-page-access";

export default async function IntegrationsLayout({ children }: { children: ReactNode }) {
  const access = await requireIntegrationsManagePage();
  if (!access.ok) {
    return <div className="mx-auto max-w-xl py-10">{access.deny}</div>;
  }
  return <>{children}</>;
}
