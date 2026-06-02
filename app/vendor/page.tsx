import type { Metadata } from "next";

import { VendorRecruitmentLanding } from "@/components/marketing/vendor-recruitment-landing";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import {
  VENDOR_RECRUITMENT_HEADLINE,
  VENDOR_RECRUITMENT_SUBHEADLINE,
} from "@/lib/marketing/vendor-recruitment-content";

export const metadata: Metadata = marketingPageMetadata({
  title: "Become a Marketplace Vendor — HoReCa B2B Supply | OS Kitchen",
  description: `${VENDOR_RECRUITMENT_HEADLINE} ${VENDOR_RECRUITMENT_SUBHEADLINE}`,
  path: "/vendor",
  keywords: [
    "HoReCa marketplace vendor",
    "restaurant supplier platform",
    "B2B food service marketplace",
    "commissary supplier onboarding",
    "OS Kitchen vendor registration",
  ],
});

export default function VendorRecruitmentPage() {
  return <VendorRecruitmentLanding />;
}
