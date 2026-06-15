import { isGa4DataApiConfigured } from "@/lib/storefront/ga4-data-api";

export type Ga4PropertyValidation = {
  ok: boolean;
  headline: string;
  detail: string;
};

/** Validate GA4 property ID is reachable via Data API (SEO save / onboarding). */
export async function validateGa4PropertyId(propertyId: string | null | undefined): Promise<Ga4PropertyValidation> {
  const id = propertyId?.replace(/\D/g, "") ?? "";
  if (!id) {
    return {
      ok: true,
      headline: "No property ID",
      detail: "Optional — add when ready for auto parity.",
    };
  }

  if (!isGa4DataApiConfigured()) {
    return {
      ok: false,
      headline: "GA4 Data API not configured",
      detail: "Set GA4_SERVICE_ACCOUNT_JSON on the server before validating property access.",
    };
  }

  const { fetchGa4ArmCheckoutRates } = await import("@/lib/storefront/ga4-data-api");
  const result = await fetchGa4ArmCheckoutRates({ propertyId: id, days: 1 });
  if (result) {
    return {
      ok: true,
      headline: "Property accessible",
      detail: `GA4 Data API read succeeded for property ${id}.`,
    };
  }

  return {
    ok: false,
    headline: "Property not accessible",
    detail: "Grant service account Viewer on this property or check the numeric property ID.",
  };
}
