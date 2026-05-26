/** Brand filter for multi-brand workspaces. */
export type BrandScopeMode = "ALL" | "SINGLE";

export type BrandScope = {
  mode: BrandScopeMode;
  brandId: string | null;
};

export function allBrands(): BrandScope {
  return { mode: "ALL", brandId: null };
}

export function singleBrand(brandId: string): BrandScope {
  return { mode: "SINGLE", brandId };
}
