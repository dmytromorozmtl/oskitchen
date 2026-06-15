import type { Metadata } from "next";

import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Pricing",
  description: `${APP_NAME} plans for weekly food operations — Starter, Pro, Team, and Enterprise.`,
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
