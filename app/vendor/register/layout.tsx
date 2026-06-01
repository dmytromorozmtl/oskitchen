import Link from "next/link";

export default function VendorRegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-card/80">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              OS Kitchen Marketplace
            </p>
            <p className="text-sm font-semibold">Vendor onboarding</p>
          </div>
          <nav className="flex gap-3 text-sm">
            <Link href="/vendor/register" className="text-muted-foreground hover:text-foreground">
              Register
            </Link>
            <Link href="/vendor/register/status" className="text-muted-foreground hover:text-foreground">
              Status
            </Link>
            <Link href="/dashboard/marketplace" className="text-muted-foreground hover:text-foreground">
              Buyer hub
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
