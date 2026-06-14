import {
  buildVendorOnboardingPortalDemoReport,
  buildVendorOnboardingPortalReport,
  type VendorOnboardingPortalReport,
} from "@/lib/marketplace/vendor-onboarding-portal-p2-116-operations";
import { VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID } from "@/lib/marketplace/vendor-onboarding-portal-p2-116-policy";
import { parseVendorCabinetSettings } from "@/lib/marketplace/vendor-settings-types";
import { prisma } from "@/lib/prisma";
import { loadVendorSettings } from "@/services/marketplace/vendor-settings-service";

export type VendorOnboardingPortalSnapshot = VendorOnboardingPortalReport & {
  mode: "live" | "demo";
  analyzedAt: string;
};

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

export async function loadVendorOnboardingPortalSnapshot(input: {
  workspaceId: string | null;
}): Promise<VendorOnboardingPortalSnapshot> {
  try {
    if (input.workspaceId) {
      const vendor = await prisma.vendor.findFirst({
        where: { workspaceId: input.workspaceId },
        orderBy: { updatedAt: "desc" },
        include: {
          products: {
            select: { status: true, moq: true },
          },
        },
      });

      if (vendor) {
        const settings = await loadVendorSettings(vendor.id);
        const cabinet = parseVendorCabinetSettings(vendor.documents);
        const cutoffMatch = cabinet.profile.description?.match(/cutoff[:\s]+([0-2]\d:[0-5]\d)/i);
        const orderCutoffTime = cutoffMatch?.[1] ?? null;

        const catalogSkuCount = vendor.products.length;
        const activeSkuCount = vendor.products.filter((p) => p.status === "ACTIVE").length;
        const moqValues = vendor.products.map((p) => p.moq);

        const report = buildVendorOnboardingPortalReport({
          vendorId: vendor.id,
          companyName: vendor.companyName,
          vendorStatus: vendor.status,
          planTier: vendor.planTier,
          commissionRatePct: decimalToNumber(vendor.commissionRate),
          catalogSkuCount,
          activeSkuCount,
          deliveryZoneCount: settings?.settings.profile.deliveryZones.length ?? cabinet.profile.deliveryZones.length,
          orderCutoffTime,
          moqValues: moqValues.length > 0 ? moqValues : [1],
        });

        return {
          ...report,
          policyId: VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID,
          mode: "live",
          analyzedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Fall through to demo fixture
  }

  const demo = buildVendorOnboardingPortalDemoReport();

  return {
    ...demo,
    policyId: VENDOR_ONBOARDING_PORTAL_P2_116_POLICY_ID,
    mode: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
