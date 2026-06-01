export type VolumePricingTier = {
  minQuantity: number;
  price: number;
};

export function resolveUnitPrice(
  product: { basePrice: number; volumePricing: readonly VolumePricingTier[] },
  quantity: number,
  variantPrice: number | null,
): number {
  if (variantPrice != null) return variantPrice;
  let price = product.basePrice;
  for (const tier of product.volumePricing) {
    if (quantity >= tier.minQuantity) price = tier.price;
  }
  return price;
}
