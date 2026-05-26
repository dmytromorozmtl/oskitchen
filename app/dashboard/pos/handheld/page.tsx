import Link from 'next/link';

import { getTenantActor } from '@/lib/scope/cached-tenant';

export default async function HandheldPOSPage() {
  await getTenantActor();

  return (
    <div className="max-w-md mx-auto space-y-4 pb-20">
      <div className="text-center py-4">
        <h1 className="text-xl font-bold">Handheld POS</h1>
        <p className="text-sm text-muted-foreground">Take orders at the table</p>
      </div>

      <div className="bg-card rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Quick Products</p>
        <p className="text-xs text-muted-foreground mb-4">
          Handheld POS loads the same products as the main POS terminal. Open this page on a tablet
          or phone to take orders tableside.
        </p>
        <div className="text-center py-8 text-muted-foreground">
          <p>Handheld mode reuses the POS Terminal interface.</p>
          <p className="text-sm mt-1">
            <Link href="/dashboard/pos/terminal" className="text-primary hover:underline">
              Open POS Terminal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
