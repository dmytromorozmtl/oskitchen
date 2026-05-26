import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual test",
  robots: { index: false, follow: false },
};

export default function VisualTestLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background p-8">{children}</div>;
}
