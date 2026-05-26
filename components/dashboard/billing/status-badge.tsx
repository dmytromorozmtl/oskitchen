import { Badge } from "@/components/ui/badge";
import { BILLING_STATUS_LABEL, BILLING_STATUS_TONE, type BillingStatusKey } from "@/lib/billing/billing-status";

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
};

export function BillingStatusBadge({ status }: { status: BillingStatusKey }) {
  return <Badge className={TONE_CLASS[BILLING_STATUS_TONE[status]]}>{BILLING_STATUS_LABEL[status]}</Badge>;
}

export function StripeConfigBadge({ state }: { state: "configured" | "partially-configured" | "missing" | "dev-disabled" }) {
  const label =
    state === "configured" ? "Stripe configured"
    : state === "partially-configured" ? "Stripe partial"
    : state === "dev-disabled" ? "Dev: billing bypassed"
    : "Stripe not configured";
  const tone =
    state === "configured" ? "success"
    : state === "partially-configured" ? "warning"
    : state === "dev-disabled" ? "info"
    : "danger";
  return <Badge className={TONE_CLASS[tone]}>{label}</Badge>;
}
