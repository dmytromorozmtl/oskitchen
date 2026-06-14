import { hasMarketableEmail, isPlaceholderKitchenOsEmail } from "@/lib/customers/customer-display";

/** Guest POS walk-through: placeholder email is internal-only; CRM sync is skipped upstream. */
export function describeGuestPosCustomer(input: { email: string | null | undefined; phone: string | null | undefined }): {
  isGuestPlaceholder: boolean;
  canReceiveEmailReceipt: boolean;
} {
  const guest = isPlaceholderKitchenOsEmail(input.email);
  return {
    isGuestPlaceholder: guest,
    canReceiveEmailReceipt: hasMarketableEmail(input.email),
  };
}
