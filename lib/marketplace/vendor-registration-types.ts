import type { VendorStatus, VendorType } from "@prisma/client";

export type VendorRegistrationDocument = {
  kind: "registration" | "upload" | "review";
  country?: string;
  contactEmail?: string;
  contactPhone?: string | null;
  website?: string | null;
  submittedByUserId?: string;
  submittedAt?: string;
  fileName?: string;
  fileUrl?: string | null;
  uploadedAt?: string;
  note?: string;
};

export type VendorRegistrationSummary = {
  vendorId: string;
  companyName: string;
  legalName: string;
  type: VendorType;
  status: VendorStatus;
  country: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  website: string | null;
  documents: VendorRegistrationDocument[];
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function parseVendorDocuments(raw: unknown): VendorRegistrationDocument[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is VendorRegistrationDocument => {
    return typeof entry === "object" && entry != null && typeof (entry as VendorRegistrationDocument).kind === "string";
  });
}

export function extractRegistrationMeta(
  documents: VendorRegistrationDocument[],
): Pick<VendorRegistrationSummary, "country" | "contactEmail" | "contactPhone" | "website"> {
  const registration = documents.find((doc) => doc.kind === "registration");
  return {
    country: registration?.country ?? null,
    contactEmail: registration?.contactEmail ?? null,
    contactPhone: registration?.contactPhone ?? null,
    website: registration?.website ?? null,
  };
}

export function vendorStatusLabel(status: VendorStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export const VENDOR_TYPE_OPTIONS: Array<{ value: VendorType; label: string }> = [
  { value: "MANUFACTURER", label: "Manufacturer" },
  { value: "DISTRIBUTOR", label: "Distributor" },
  { value: "SERVICE_COMPANY", label: "Service company" },
  { value: "COMBO", label: "Manufacturer + distributor" },
];

export function vendorStatusBadgeVariant(
  status: VendorStatus,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "REJECTED":
    case "SUSPENDED":
    case "DEACTIVATED":
      return "destructive";
    case "PENDING":
    case "UNDER_REVIEW":
      return "secondary";
    default:
      return "outline";
  }
}
