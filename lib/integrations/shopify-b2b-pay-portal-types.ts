import type { B2bInvoiceDraftLink } from "@/lib/integrations/shopify-b2b-invoice-draft-metadata";

export type B2bPayPortalView = {
  businessName: string;
  invoiceNumber: string;
  companyName: string | null;
  poNumber: string | null;
  paymentTermsLabel: string | null;
  amountDueCents: number;
  currency: string;
  amountDueLabel: string;
  dueAt: string | null;
  dueLabel: string | null;
  status: B2bInvoiceDraftLink["status"];
  stripeCheckoutAvailable: boolean;
  achInstructions: string;
  honesty: string;
  paid: boolean;
};
