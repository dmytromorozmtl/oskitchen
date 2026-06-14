import type { Prisma, VendorStatus, VendorType } from "@prisma/client";

import {
  extractRegistrationMeta,
  parseVendorDocuments,
  type VendorRegistrationDocument,
  type VendorRegistrationSummary,
} from "@/lib/marketplace/vendor-registration-types";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/services/audit/audit-service";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

export type SubmitVendorRegistrationInput = {
  workspaceId: string;
  actorUserId: string;
  actorEmail: string | null;
  actorRole: string;
  companyName: string;
  legalName: string;
  type: VendorType;
  country: string;
  contactEmail: string;
  contactPhone?: string | null;
  website?: string | null;
  documents?: Array<{ fileName: string; fileUrl?: string | null }>;
};

export type VendorVerificationQueueRow = VendorRegistrationSummary & {
  workspaceName: string | null;
};

function mapVendor(row: {
  id: string;
  companyName: string;
  legalName: string;
  type: VendorType;
  status: VendorStatus;
  documents: unknown;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): VendorRegistrationSummary {
  const documents = parseVendorDocuments(row.documents);
  const meta = extractRegistrationMeta(documents);
  return {
    vendorId: row.id,
    companyName: row.companyName,
    legalName: row.legalName,
    type: row.type,
    status: row.status,
    documents,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ...meta,
  };
}

export async function loadWorkspaceVendorRegistration(
  workspaceId: string,
): Promise<VendorRegistrationSummary | null> {
  const vendor = await prisma.vendor.findFirst({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });
  if (!vendor) return null;
  return mapVendor(vendor);
}

export async function submitVendorRegistration(
  input: SubmitVendorRegistrationInput,
): Promise<{ ok: true; vendorId: string } | { ok: false; error: string }> {
  const existing = await prisma.vendor.findFirst({
    where: { workspaceId: input.workspaceId },
    orderBy: { createdAt: "desc" },
    select: { id: true, status: true },
  });

  if (existing?.status === "APPROVED") {
    return { ok: false, error: "This workspace already has an approved marketplace vendor." };
  }
  if (existing?.status === "PENDING" || existing?.status === "UNDER_REVIEW") {
    return { ok: false, error: "A vendor application is already under review." };
  }

  const now = new Date().toISOString();
  const documents: VendorRegistrationDocument[] = [
    {
      kind: "registration",
      country: input.country.trim(),
      contactEmail: input.contactEmail.trim(),
      contactPhone: input.contactPhone?.trim() || null,
      website: input.website?.trim() || null,
      submittedByUserId: input.actorUserId,
      submittedAt: now,
    },
    ...(input.documents ?? []).map((doc) => ({
      kind: "upload" as const,
      fileName: doc.fileName.trim(),
      fileUrl: doc.fileUrl?.trim() || null,
      uploadedAt: now,
    })),
  ];

  const vendor =
    existing?.status === "REJECTED"
      ? await prisma.vendor.update({
          where: { id: existing.id },
          data: {
            companyName: input.companyName.trim(),
            legalName: input.legalName.trim(),
            type: input.type,
            status: "PENDING",
            verifiedAt: null,
            documents: documents as Prisma.InputJsonValue,
          },
        })
      : await prisma.vendor.create({
          data: {
            workspaceId: input.workspaceId,
            companyName: input.companyName.trim(),
            legalName: input.legalName.trim(),
            type: input.type,
            status: "PENDING",
            documents: documents as Prisma.InputJsonValue,
          },
        });

  await auditLog({
    workspaceId: input.workspaceId,
    actor: {
      userId: input.actorUserId,
      email: input.actorEmail,
      role: input.actorRole,
    },
    action: AUDIT_ACTIONS.SETTINGS_UPDATED,
    category: "OTHER",
    source: "USER",
    severity: "INFO",
    entity: { type: "MarketplaceVendor", id: vendor.id, label: vendor.companyName },
    metadata: {
      operation: "marketplace.vendor.registration_submitted",
      vendorId: vendor.id,
      type: input.type,
      country: input.country,
    },
  });

  return { ok: true, vendorId: vendor.id };
}

export async function loadVendorVerificationQueue(input?: {
  status?: VendorStatus[];
}): Promise<VendorVerificationQueueRow[]> {
  const statuses = input?.status ?? ["PENDING", "UNDER_REVIEW"];

  const rows = await prisma.vendor.findMany({
    where: { status: { in: statuses } },
    orderBy: { createdAt: "asc" },
    include: {
      workspace: { select: { name: true } },
    },
  });

  return rows.map((row) => ({
    ...mapVendor(row),
    workspaceName: row.workspace?.name ?? null,
  }));
}

export async function reviewVendorRegistration(input: {
  vendorId: string;
  decision: "approve" | "reject" | "review";
  reviewerUserId: string;
  reviewerEmail: string | null;
  notes?: string | null;
}): Promise<{ ok: true; status: VendorStatus } | { ok: false; error: string }> {
  const vendor = await prisma.vendor.findUnique({
    where: { id: input.vendorId },
    select: { id: true, status: true, workspaceId: true, companyName: true, documents: true },
  });

  if (!vendor) return { ok: false, error: "Vendor not found." };
  if (!["PENDING", "UNDER_REVIEW"].includes(vendor.status)) {
    return { ok: false, error: "Vendor is not in the verification queue." };
  }

  const status: VendorStatus =
    input.decision === "approve"
      ? "APPROVED"
      : input.decision === "reject"
        ? "REJECTED"
        : "UNDER_REVIEW";

  const documents = parseVendorDocuments(vendor.documents);
  if (input.notes?.trim()) {
    documents.push({
      kind: "review",
      note: input.notes.trim(),
      uploadedAt: new Date().toISOString(),
    });
  }

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: {
      status,
      verifiedAt: status === "APPROVED" ? new Date() : null,
      documents: documents as Prisma.InputJsonValue,
    },
  });

  if (vendor.workspaceId) {
    await auditLog({
      workspaceId: vendor.workspaceId,
      actor: {
        userId: input.reviewerUserId,
        email: input.reviewerEmail,
        role: "PLATFORM",
      },
      action: AUDIT_ACTIONS.SETTINGS_UPDATED,
      category: "OTHER",
      source: "USER",
      severity: status === "REJECTED" ? "WARNING" : "INFO",
      entity: { type: "MarketplaceVendor", id: vendor.id, label: vendor.companyName },
      metadata: {
        operation: `marketplace.vendor.registration_${input.decision}`,
        vendorId: vendor.id,
        status,
      },
    });
  }

  return { ok: true, status };
}
