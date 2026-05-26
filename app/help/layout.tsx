import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="text-sm font-semibold">
            {APP_NAME}
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/help" className="hover:text-foreground">
              Help home
            </Link>
            <Link href="/help/order-hub" className="hover:text-foreground">
              Order hub
            </Link>
            <Link href="/help/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link href="/book-demo" className="hover:text-foreground">
              Book call
            </Link>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-10">{children}</div>
    </div>
  );
}
