import { shopifyAdminGid } from "@/lib/commercial/shopify-market-b2b-location-routing";

function gidTail(gid: string): string {
  const parts = gid.split("/");
  return parts[parts.length - 1] ?? gid;
}

/**
 * GraphQL Admin orders expose B2B context on `purchasingEntity`, not REST `company`.
 * Normalize into REST-shaped `company` block so existing B2B routing can reuse it.
 */
export function attachShopifyGraphqlPurchasingEntityToRawOrder(
  node: Record<string, unknown>,
): Record<string, unknown> {
  if (node.company && typeof node.company === "object") {
    return node;
  }

  const purchasingEntity = node.purchasingEntity;
  if (!purchasingEntity || typeof purchasingEntity !== "object") {
    return node;
  }

  const pe = purchasingEntity as Record<string, unknown>;
  const typename = pe.__typename != null ? String(pe.__typename) : "";
  if (typename !== "PurchasingCompany") {
    return node;
  }

  const company =
    pe.company && typeof pe.company === "object"
      ? (pe.company as Record<string, unknown>)
      : null;
  const location =
    pe.location && typeof pe.location === "object"
      ? (pe.location as Record<string, unknown>)
      : null;

  if (!company?.id && !location?.id) {
    return node;
  }

  const companyGid = company?.id != null ? String(company.id) : null;
  const locationGid = location?.id != null ? String(location.id) : null;

  return {
    ...node,
    company: {
      id: companyGid ? gidTail(companyGid) : undefined,
      location_id: locationGid ? gidTail(locationGid) : undefined,
      name: company?.name != null ? String(company.name) : undefined,
      location_name: location?.name != null ? String(location.name) : undefined,
      __kitchenosGraphqlPurchasingEntity: {
        companyGid: companyGid ? shopifyAdminGid("Company", gidTail(companyGid)) : null,
        locationGid: locationGid
          ? shopifyAdminGid("CompanyLocation", gidTail(locationGid))
          : null,
      },
    },
  };
}
