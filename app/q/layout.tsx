import type { ReactNode } from "react";

export default function QrOrderingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 dark">{children}</div>
  );
}
