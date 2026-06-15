"use client";

import type { ReactNode } from "react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeaderClient } from "@/components/marketing/site-header-client";

/** Client-safe marketing shell — no server auth / next/headers. */
export function PublicShellClient({
  children,
  isAuthenticated = false,
}: {
  children: ReactNode;
  isAuthenticated?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeaderClient isAuthenticated={isAuthenticated} />
      {children}
      <SiteFooter />
    </div>
  );
}
