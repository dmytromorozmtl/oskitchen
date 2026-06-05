import { Loader2 } from "lucide-react";

export default function InvoiceScannerLoading() {
  return (
    <div className="mx-auto flex max-w-3xl items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      Loading invoice scanner…
    </div>
  );
}
