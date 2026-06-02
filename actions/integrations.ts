"use server";


import { fail, ok } from "@/lib/action-result";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import {
  IntegrationProvider,
  IntegrationStatus,
} from "@prisma/client";

import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import {
  integrationConnectionByIdWhereForOwner,
  integrationConnectionByProviderWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import {
  encryptOptional,
  EncryptionKeyMissingError,
  isEncryptionConfigured,
} from "@/lib/crypto";
import {
  shopifySettingsSchema,
  uberDirectSettingsSchema,
  uberEatsSettingsSchema,
  wooCommerceSettingsSchema,
} from "@/lib/schemas/integration-forms";
import { prisma } from "@/lib/prisma";
import { logChannelCredentialAudit } from "@/lib/channels/credentials";
import { safeError } from "@/lib/security";

export async function saveWooCommerceSettings(formData: FormData) {
  try {
    const gate = await requireIntegrationsActor({ operation: "integrations.save_woocommerce" });
    if (!gate.ok) return fail(gate.error);
    const { sessionUser: user, userId } = gate.actor;
    const workspaceId = gate.workspaceId;
    if (!isEncryptionConfigured()) {
      return fail(
        "Encryption is not configured. Set ENCRYPTION_KEY in .env.local before saving credentials.",
      );
    }

    const parsed = wooCommerceSettingsSchema.safeParse({
      name: formData.get("name"),
      baseUrl: formData.get("baseUrl"),
      consumerKey: formData.get("consumerKey"),
      consumerSecret: formData.get("consumerSecret"),
      webhookSecret: formData.get("webhookSecret"),
      autoImportOrders: formData.get("autoImportOrders") === "on",
      autoCreateProducts: formData.get("autoCreateProducts") === "on",
    });

    if (!parsed.success) {
      return fail(
        parsed.error.flatten().fieldErrors.baseUrl?.[0] ??
          parsed.error.flatten().fieldErrors.consumerKey?.[0] ??
          "Invalid WooCommerce settings",
      );
    }

    const d = parsed.data;
    const existing = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByProviderWhereForOwner(
        userId,
        IntegrationProvider.WOOCOMMERCE,
      ),
    });

    const consumerKeyEnc =
      d.consumerKey.trim().length > 0
        ? encryptOptional(d.consumerKey.trim())
        : existing?.consumerKeyEncrypted ?? null;
    const consumerSecretEnc =
      d.consumerSecret.trim().length > 0
        ? encryptOptional(d.consumerSecret.trim())
        : existing?.consumerSecretEncrypted ?? null;
    const webhookSecretEnc =
      (d.webhookSecret?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.webhookSecret!.trim())
        : existing?.webhookSecretEncrypted ?? null;

    if (!consumerKeyEnc || !consumerSecretEnc) {
      return fail(
        "Consumer key and secret are required (leave blank only if already saved).",
      );
    }

    const settingsJson = {
      autoImportOrders: d.autoImportOrders ?? false,
      autoCreateProducts: d.autoCreateProducts ?? false,
    };

    const row = existing
      ? await prisma.integrationConnection.update({
          where: { id: existing.id },
          data: {
            name: d.name,
            baseUrl: d.baseUrl.trim(),
            workspaceId: existing.workspaceId ?? workspaceId,
            consumerKeyEncrypted: consumerKeyEnc,
            consumerSecretEncrypted: consumerSecretEnc,
            webhookSecretEncrypted: webhookSecretEnc,
            settingsJson,
            status: IntegrationStatus.NEEDS_AUTH,
          },
        })
      : await prisma.integrationConnection.create({
          data: {
            id: randomUUID(),
            userId,
            workspaceId,
            provider: IntegrationProvider.WOOCOMMERCE,
            name: d.name,
            baseUrl: d.baseUrl.trim(),
            status: IntegrationStatus.NEEDS_AUTH,
            consumerKeyEncrypted: consumerKeyEnc,
            consumerSecretEncrypted: consumerSecretEnc,
            webhookSecretEncrypted: webhookSecretEnc,
            settingsJson,
          },
        });
    revalidatePath("/dashboard/sales-channels");
    revalidatePath("/dashboard/integrations");
    revalidatePath("/dashboard/integrations/woocommerce");
    await logChannelCredentialAudit({
      connectionId: row.id,
      userId,
      performedBy: user.email ?? user.id,
      action: "SAVE",
      metadata: { provider: "WOOCOMMERCE" },
    });
    return ok({ connectionId: row.id });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      return fail(e.message);
    }
    return fail(safeError(e));
  }
}

export async function saveShopifySettings(formData: FormData) {
  try {
    const gate = await requireIntegrationsActor({ operation: "integrations.save_shopify" });
    if (!gate.ok) return fail(gate.error);
    const { sessionUser: user, userId } = gate.actor;
    const workspaceId = gate.workspaceId;
    if (!isEncryptionConfigured()) {
      return fail(
        "Encryption is not configured. Set ENCRYPTION_KEY in .env.local before saving credentials.",
      );
    }

    const parsed = shopifySettingsSchema.safeParse({
      name: formData.get("name"),
      shopDomain: formData.get("shopDomain"),
      adminAccessToken: formData.get("adminAccessToken"),
      webhookSecret: formData.get("webhookSecret"),
      apiVersion: formData.get("apiVersion") || "2025-01",
    });

    if (!parsed.success) {
      return fail(
        parsed.error.flatten().fieldErrors.shopDomain?.[0] ??
          "Invalid Shopify settings",
      );
    }

    const d = parsed.data;
    const existing = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByProviderWhereForOwner(
        userId,
        IntegrationProvider.SHOPIFY,
      ),
    });

    const tokenEnc =
      (d.adminAccessToken?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.adminAccessToken!.trim())
        : existing?.accessTokenEncrypted ?? null;
    const webhookSecretEnc =
      (d.webhookSecret?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.webhookSecret!.trim())
        : existing?.webhookSecretEncrypted ?? null;

    if (!tokenEnc) {
      return fail(
        "Admin API access token is required (leave blank only if already saved).",
      );
    }

    const domain = d.shopDomain.trim().toLowerCase();
    const settingsJson = {
      apiVersion: d.apiVersion,
    };

    const row = existing
      ? await prisma.integrationConnection.update({
          where: { id: existing.id },
          data: {
            name: d.name,
            shopDomain: domain,
            workspaceId: existing.workspaceId ?? workspaceId,
            accessTokenEncrypted: tokenEnc,
            webhookSecretEncrypted: webhookSecretEnc,
            settingsJson,
            status: IntegrationStatus.NEEDS_AUTH,
          },
        })
      : await prisma.integrationConnection.create({
          data: {
            id: randomUUID(),
            userId,
            workspaceId,
            provider: IntegrationProvider.SHOPIFY,
            name: d.name,
            shopDomain: domain,
            status: IntegrationStatus.NEEDS_AUTH,
            accessTokenEncrypted: tokenEnc,
            webhookSecretEncrypted: webhookSecretEnc,
            settingsJson,
          },
        });
    revalidatePath("/dashboard/sales-channels");
    revalidatePath("/dashboard/integrations");
    revalidatePath("/dashboard/integrations/shopify");
    await logChannelCredentialAudit({
      connectionId: row.id,
      userId,
      performedBy: user.email ?? user.id,
      action: "SAVE",
      metadata: { provider: "SHOPIFY" },
    });
    return ok({ connectionId: row.id });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      return fail(e.message);
    }
    return fail(safeError(e));
  }
}

export async function saveUberEatsSettings(formData: FormData) {
  try {
    const gate = await requireIntegrationsActor({ operation: "integrations.save_uber_eats" });
    if (!gate.ok) return fail(gate.error);
    const { sessionUser: user, userId } = gate.actor;
    const workspaceId = gate.workspaceId;
    if (!isEncryptionConfigured()) {
      return fail(
        "Encryption is not configured. Set ENCRYPTION_KEY in .env.local before saving credentials.",
      );
    }

    const parsed = uberEatsSettingsSchema.safeParse({
      name: formData.get("name"),
      externalStoreId: formData.get("externalStoreId"),
      clientId: formData.get("clientId"),
      clientSecret: formData.get("clientSecret"),
      webhookSigningSecret: formData.get("webhookSigningSecret"),
      menuSyncEnabled: formData.get("menuSyncEnabled") === "on",
      orderIngestionEnabled: formData.get("orderIngestionEnabled") === "on",
    });

    if (!parsed.success) {
      return fail("Invalid Uber Eats settings");
    }

    const d = parsed.data;
    const existing = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByProviderWhereForOwner(
        userId,
        IntegrationProvider.UBER_EATS,
      ),
    });

    const clientIdEnc =
      (d.clientId?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.clientId!.trim())
        : existing?.consumerKeyEncrypted ?? null;
    const clientSecretEnc =
      (d.clientSecret?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.clientSecret!.trim())
        : existing?.consumerSecretEncrypted ?? null;
    const webhookEnc =
      (d.webhookSigningSecret?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.webhookSigningSecret!.trim())
        : existing?.webhookSecretEncrypted ?? null;

    const settingsJson = {
      menuSyncEnabled: d.menuSyncEnabled ?? false,
      orderIngestionEnabled: d.orderIngestionEnabled ?? false,
    };

    const row = existing
      ? await prisma.integrationConnection.update({
          where: { id: existing.id },
          data: {
            name: d.name,
            externalStoreId: d.externalStoreId?.trim() || null,
            workspaceId: existing.workspaceId ?? workspaceId,
            consumerKeyEncrypted: clientIdEnc,
            consumerSecretEncrypted: clientSecretEnc,
            webhookSecretEncrypted: webhookEnc,
            settingsJson,
            status: IntegrationStatus.NEEDS_AUTH,
            lastError:
              "Uber Eats Marketplace requires partner-approved credentials before going live.",
          },
        })
      : await prisma.integrationConnection.create({
          data: {
            id: randomUUID(),
            userId,
            workspaceId,
            provider: IntegrationProvider.UBER_EATS,
            name: d.name,
            externalStoreId: d.externalStoreId?.trim() || null,
            status: IntegrationStatus.NEEDS_AUTH,
            consumerKeyEncrypted: clientIdEnc,
            consumerSecretEncrypted: clientSecretEnc,
            webhookSecretEncrypted: webhookEnc,
            settingsJson,
            lastError:
              "Uber Eats Marketplace requires partner-approved credentials before going live.",
          },
        });

    revalidatePath("/dashboard/sales-channels");
    revalidatePath("/dashboard/integrations");
    revalidatePath("/dashboard/integrations/uber-eats");
    revalidatePath("/dashboard/integrations/uber-eats/live");
    await logChannelCredentialAudit({
      connectionId: row.id,
      userId,
      performedBy: user.email ?? user.id,
      action: "SAVE",
      metadata: { provider: "UBER_EATS" },
    });
    return ok({ connectionId: row.id });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      return fail(e.message);
    }
    return fail(safeError(e));
  }
}

export async function saveUberDirectSettings(formData: FormData) {
  try {
    const gate = await requireIntegrationsActor({ operation: "integrations.save_uber_direct" });
    if (!gate.ok) return fail(gate.error);
    const { sessionUser: user, userId } = gate.actor;
    const workspaceId = gate.workspaceId;
    if (!isEncryptionConfigured()) {
      return fail(
        "Encryption is not configured. Set ENCRYPTION_KEY in .env.local before saving credentials.",
      );
    }

    const parsed = uberDirectSettingsSchema.safeParse({
      name: formData.get("name"),
      customerId: formData.get("customerId"),
      clientId: formData.get("clientId"),
      clientSecret: formData.get("clientSecret"),
      pickupAddress: formData.get("pickupAddress"),
      deliveryQuoteEnabled: formData.get("deliveryQuoteEnabled") === "on",
      autoDispatchEnabled: formData.get("autoDispatchEnabled") === "on",
      deliveryRadiusKm: formData.get("deliveryRadiusKm") || undefined,
      defaultPickupInstructions: formData.get("defaultPickupInstructions"),
    });

    if (!parsed.success) {
      return fail("Invalid Uber Direct settings");
    }

    const d = parsed.data;
    const existing = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByProviderWhereForOwner(
        userId,
        IntegrationProvider.UBER_DIRECT,
      ),
    });

    const custEnc =
      (d.customerId?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.customerId!.trim())
        : existing?.accessTokenEncrypted ?? null;
    const clientIdEnc =
      (d.clientId?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.clientId!.trim())
        : existing?.consumerKeyEncrypted ?? null;
    const clientSecretEnc =
      (d.clientSecret?.trim()?.length ?? 0) > 0
        ? encryptOptional(d.clientSecret!.trim())
        : existing?.consumerSecretEncrypted ?? null;

    const settingsJson = {
      pickupAddress: d.pickupAddress?.trim() || "",
      deliveryQuoteEnabled: d.deliveryQuoteEnabled ?? false,
      autoDispatchEnabled: d.autoDispatchEnabled ?? false,
      deliveryRadiusKm: d.deliveryRadiusKm ?? null,
      defaultPickupInstructions: d.defaultPickupInstructions?.trim() || "",
    };

    const row = existing
      ? await prisma.integrationConnection.update({
          where: { id: existing.id },
          data: {
            name: d.name,
            workspaceId: existing.workspaceId ?? workspaceId,
            accessTokenEncrypted: custEnc,
            consumerKeyEncrypted: clientIdEnc,
            consumerSecretEncrypted: clientSecretEnc,
            settingsJson,
            status: IntegrationStatus.NEEDS_AUTH,
            lastError:
              "Uber Direct delivery APIs require a provisioned customer account (placeholder until wired).",
          },
        })
      : await prisma.integrationConnection.create({
          data: {
            id: randomUUID(),
            userId,
            workspaceId,
            provider: IntegrationProvider.UBER_DIRECT,
            name: d.name,
            status: IntegrationStatus.NEEDS_AUTH,
            accessTokenEncrypted: custEnc,
            consumerKeyEncrypted: clientIdEnc,
            consumerSecretEncrypted: clientSecretEnc,
            settingsJson,
            lastError:
              "Uber Direct delivery APIs require a provisioned customer account (placeholder until wired).",
          },
        });

    revalidatePath("/dashboard/sales-channels");
    revalidatePath("/dashboard/integrations");
    revalidatePath("/dashboard/integrations/uber-direct");
    await logChannelCredentialAudit({
      connectionId: row.id,
      userId,
      performedBy: user.email ?? user.id,
      action: "SAVE",
      metadata: { provider: "UBER_DIRECT" },
    });
    return ok({ connectionId: row.id });
  } catch (e) {
    if (e instanceof EncryptionKeyMissingError) {
      return fail(e.message);
    }
    return fail(safeError(e));
  }
}

export async function disconnectIntegration(formData: FormData) {
  try {
    const gate = await requireIntegrationsActor({ operation: "integrations.disconnect" });
    if (!gate.ok) return fail(gate.error);
    const { sessionUser: user, userId } = gate.actor;
    const id = String(formData.get("connectionId") ?? "");
    if (!id) return fail("Missing connection");

    const conn = await prisma.integrationConnection.findFirst({
      where: await integrationConnectionByIdWhereForOwner(userId, id),
    });
    if (conn) {
      await logChannelCredentialAudit({
        connectionId: conn.id,
        userId,
        performedBy: user.email ?? user.id,
        action: "DISCONNECT",
        metadata: { provider: conn.provider },
      });
    }

    await prisma.integrationConnection.deleteMany({
      where: await integrationConnectionByIdWhereForOwner(userId, id),
    });

    revalidatePath("/dashboard/sales-channels");
    revalidatePath("/dashboard/integrations");
    return ok(undefined);
  } catch (e) {
    return fail(safeError(e));
  }
}
