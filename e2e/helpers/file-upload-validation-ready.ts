import { randomUUID } from "node:crypto";

import { test } from "@playwright/test";

import {
  IMPORT_CSV_MAX_BYTES,
  KITCHEN_RASTER_IMAGE_MAX_BYTES,
  PROFILE_AVATAR_MAX_BYTES,
  STOREFRONT_FORM_FILE_MAX_BYTES,
  STOREFRONT_MEDIA_MAX_BYTES,
} from "@/lib/upload-policy/media-upload-validation";

export const hasFileUploadValidationDb = Boolean(process.env.DATABASE_URL?.trim());

export type FileUploadFixtureKind =
  | "empty"
  | "oversized"
  | "foreign_mime"
  | "fake_pdf"
  | "unsafe_svg"
  | "valid_png"
  | "valid_pdf";

export type StorefrontFormUploadFixture = {
  storeSlug: string;
  formId: string;
  fieldId: string;
  cleanup: () => Promise<void>;
};

export function skipFileUploadValidationIfNoDb(): void {
  if (!hasFileUploadValidationDb) {
    test.skip(true, "File upload validation E2E SKIPPED — missing DATABASE_URL");
  }
}

export function skipFileUploadValidationHttpIfNoBaseUrl(): void {
  const base =
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) {
    test.skip(
      true,
      "File upload validation HTTP E2E SKIPPED — set PLAYWRIGHT_BASE_URL (running app required)",
    );
  }
}

export function buildUploadFixtureBytes(
  fixture: FileUploadFixtureKind,
  channel?: "kitchen_raster" | "storefront_form" | "profile_avatar" | "import_csv" | "storefront_media",
): Uint8Array {
  switch (fixture) {
    case "empty":
      return new Uint8Array();
    case "valid_png":
      return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
    case "valid_pdf":
      return new TextEncoder().encode("%PDF-1.4 sample");
    case "fake_pdf":
      return new TextEncoder().encode("not-a-pdf");
    case "unsafe_svg":
      return new TextEncoder().encode(
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
      );
    case "foreign_mime":
      return new Uint8Array([0, 0, 0, 1]);
    case "oversized": {
      const limit =
        channel === "storefront_form"
          ? STOREFRONT_FORM_FILE_MAX_BYTES
          : channel === "profile_avatar"
            ? PROFILE_AVATAR_MAX_BYTES
            : channel === "import_csv"
              ? IMPORT_CSV_MAX_BYTES
              : channel === "storefront_media"
                ? STOREFRONT_MEDIA_MAX_BYTES
                : KITCHEN_RASTER_IMAGE_MAX_BYTES;
      return new Uint8Array(limit + 1);
    }
  }
}

export async function seedStorefrontFormUploadFixture(
  label: string,
): Promise<StorefrontFormUploadFixture> {
  const { prisma } = await import("@/lib/prisma");
  const suffix = `${label}-${randomUUID().slice(0, 8)}`;
  const owner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `file-upload-e2e-${suffix}@e2e.test`,
      fullName: `File Upload Owner ${label}`,
      role: "OWNER",
    },
  });
  const workspace = await prisma.workspace.create({
    data: {
      name: `File Upload WS ${suffix}`,
      ownerUserId: owner.id,
    },
  });
  const storeSlug = `e2e-upload-${suffix}`;
  const storefront = await prisma.storefrontSettings.create({
    data: {
      userId: owner.id,
      workspaceId: workspace.id,
      storeSlug,
      enabled: true,
      published: true,
      publicName: `E2E Upload Store ${suffix}`,
    },
  });
  const fieldId = "attachment";
  const form = await prisma.storefrontForm.create({
    data: {
      storefrontId: storefront.id,
      slug: "contact",
      title: "Contact",
      formKind: "CONTACT",
      fieldsJson: [{ id: fieldId, type: "file", label: "Attachment" }],
      active: true,
      archived: false,
    },
  });

  return {
    storeSlug,
    formId: form.id,
    fieldId,
    cleanup: async () => {
      await prisma.storefrontForm.delete({ where: { id: form.id } }).catch(() => undefined);
      await prisma.storefrontSettings.delete({ where: { id: storefront.id } }).catch(() => undefined);
      await prisma.workspace.delete({ where: { id: workspace.id } }).catch(() => undefined);
      await prisma.userProfile.delete({ where: { id: owner.id } }).catch(() => undefined);
    },
  };
}
