"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { type ThemeExperimentJson } from "@/lib/prisma/json";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { isEncryptionConfigured } from "@/lib/crypto";
import { safeError } from "@/lib/security";
import { validateAndSanitizeLegalHtml } from "@/lib/storefront/legal-content-validation";
import { canStorefront } from "@/lib/storefront/storefront-permissions";
import {
  loadPublishChecklistForStorefront,
  publishChecklistBlocksGoLive,
} from "@/lib/storefront/launch-readiness";
import { revalidateStorefrontDashboardAndPublic } from "@/lib/storefront/revalidate-storefront-dashboard";
import { resolveOwnerStorefront } from "@/lib/storefront/resolve-owner-storefront";
import { requireStorefrontAdminPermission } from "@/lib/storefront/storefront-admin-access";
import { encryptStorefrontWebhookSecret } from "@/lib/storefront/storefront-webhook-secret";
import { getStorefrontPermissionSetForUser } from "@/services/storefront/storefront-permission-service";

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const domainMode = z.enum(["PATH", "SUBDOMAIN", "CUSTOM_DOMAIN"]);

const upsertSchema = z.object({
  storeSlug: z.string().min(2).max(120),
  publicName: z.string().min(1).max(255),
  tagline: z.string().max(500).optional().or(z.literal("")),
  enabled: z.coerce.boolean(),
  published: z.coerce.boolean(),
  description: z.string().max(4000).optional().or(z.literal("")),
  activeMenuId: z.string().uuid().optional().or(z.literal("")),
  subdomain: z.string().max(120).optional().or(z.literal("")),
  primaryDomainMode: z.string().max(32).optional().or(z.literal("")),
  termsText: z.string().max(20000).optional().or(z.literal("")),
});

export async function upsertStorefrontSettings(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = upsertSchema.safeParse({
      storeSlug: formData.get("storeSlug"),
      publicName: formData.get("publicName"),
      tagline: formData.get("tagline")?.toString(),
      enabled: formData.get("enabled") === "on",
      published: formData.get("published") === "on",
      description: formData.get("description")?.toString(),
      activeMenuId: formData.get("activeMenuId")?.toString(),
      subdomain: formData.get("subdomain")?.toString(),
      primaryDomainMode: formData.get("primaryDomainMode")?.toString(),
      termsText: formData.get("termsText")?.toString(),
    });
    if (!parsed.success) {
      return { error: "Check storefront fields and try again." };
    }
    const d = parsed.data;
    const slug = slugify(d.storeSlug);
    if (!slug) return { error: "Store URL slug is invalid." };

    const menuRaw = (d.activeMenuId ?? "").trim();
    const menuId =
      menuRaw.length > 0 && /^[0-9a-f-]{36}$/i.test(menuRaw) ? menuRaw : null;
    if (menuId) {
      const menu = await prisma.menu.findFirst({
        where: { id: menuId, userId },
      });
      if (!menu) return { error: "Selected menu not found." };
      if (menu.catalogOnly) {
        return {
          error:
            "The item catalog cannot be the active storefront menu. Choose a service menu in Menu Center.",
        };
      }
    }

    const access = await requireStorefrontAdminPermission("storefront.settings");
    const existingBefore =
      (await prisma.storefrontSettings.findUnique({
        where: { id: access.storefront.id },
      })) ?? (await resolveOwnerStorefront(user.id));
    const existingSelect = existingBefore
      ? {
          id: existingBefore.id,
          storeSlug: existingBefore.storeSlug,
          workspaceId: existingBefore.workspaceId,
          themeExperimentJson: existingBefore.themeExperimentJson,
        }
      : null;

    const existingOther = await prisma.storefrontSettings.findFirst({
      where: { storeSlug: slug, NOT: { userId } },
    });
    if (existingOther) return { error: "That store URL is already taken." };

    const subRaw = (d.subdomain ?? "").trim();
    const sub = subRaw ? slugify(subRaw) : null;
    if (sub) {
      const clash = await prisma.storefrontSettings.findFirst({
        where: { subdomain: sub, NOT: { userId } },
      });
      if (clash) return { error: "That subdomain label is already taken." };
    }

    const modeParse = d.primaryDomainMode ? domainMode.safeParse(d.primaryDomainMode) : null;

    if (d.published && d.enabled && existingBefore) {
      const checklist = await loadPublishChecklistForStorefront(existingBefore.id);
      const gate = publishChecklistBlocksGoLive(checklist);
      if (gate.blocked) {
        const labels = gate.failing.map((f) => f.label).join("; ");
        return {
          error: `Cannot publish storefront until launch checklist passes: ${labels}. See Launch tab.`,
        };
      }
    }

    const payload = {
      storeSlug: slug,
      publicName: d.publicName.trim(),
      tagline: d.tagline?.trim() || null,
      enabled: d.enabled,
      published: d.published,
      description: d.description?.trim() || null,
      activeMenuId: menuId,
      subdomain: sub,
      primaryDomainMode: modeParse?.success ? modeParse.data : "PATH",
      termsText: d.termsText?.trim() || null,
    };

    const sf = existingBefore
      ? await prisma.storefrontSettings.update({
          where: { id: existingBefore.id },
          data: payload,
          select: {
            id: true,
            storeSlug: true,
            workspaceId: true,
            themeExperimentJson: true,
          },
        })
      : await prisma.storefrontSettings.create({
          data: {
            userId,
            isPrimary: true,
            ...payload,
          },
          select: {
            id: true,
            storeSlug: true,
            workspaceId: true,
            themeExperimentJson: true,
          },
        });

    const slugChanged = existingSelect && existingSelect.storeSlug !== slug;
    if (!existingSelect || slugChanged) {
      const { bootstrapThemeExperimentEdgeRouting } = await import(
        "@/services/storefront/theme-experiment-edge-routing-bootstrap"
      );
      void bootstrapThemeExperimentEdgeRouting({
        storefrontId: sf.id,
        storeSlug: sf.storeSlug,
        workspaceId: sf.workspaceId,
        themeExperimentJson: sf.themeExperimentJson,
      });
    }

    const row = await resolveOwnerStorefront(user.id);
    if (row) {
      const { ensureDefaultHomeStorefrontPage } = await import("@/services/storefront/storefront-home-service");
      const { ensureStorefrontNavFooterDefaults } = await import(
        "@/services/storefront/storefront-nav-footer-seed-service"
      );
      await ensureDefaultHomeStorefrontPage(row.id, user.id);
      await ensureStorefrontNavFooterDefaults(row.id, row.storeSlug);
    }

    revalidateStorefrontDashboardAndPublic(slug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

/** HTML form binding — ignores structured `{ ok } | { error }` returns from {@link upsertStorefrontSettings}. */
export async function upsertStorefrontSettingsFormAction(formData: FormData): Promise<void> {
  void (await upsertStorefrontSettings(formData));
}

const businessSchema = z.object({
  contactEmail: z.string().max(255).optional().or(z.literal("")),
  contactPhone: z.string().max(64).optional().or(z.literal("")),
  privacyText: z.string().max(20000).optional().or(z.literal("")),
});

/** Contact / legal fields — requires an existing storefront row (save Overview once first). */
export async function updateStorefrontBusinessSettings(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const parsed = businessSchema.safeParse({
      contactEmail: formData.get("contactEmail")?.toString(),
      contactPhone: formData.get("contactPhone")?.toString(),
      privacyText: formData.get("privacyText")?.toString(),
    });
    if (!parsed.success) return { error: "Check contact fields." };
    const d = parsed.data;
    const { permissions, email } = await getStorefrontPermissionSetForUser(user.id);
    if (!canStorefront(permissions, "storefront:edit-draft", { email })) {
      return { error: "You do not have permission to update storefront business settings." };
    }
    const emailRaw = d.contactEmail?.trim() ?? "";
    if (emailRaw && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      return { error: "Contact email looks invalid." };
    }
    const row = await resolveOwnerStorefront(user.id);
    if (!row) return { error: "Save the storefront overview once before editing business settings." };

    const privacyRaw = d.privacyText?.trim() ?? "";
    if (privacyRaw && !canStorefront(permissions, "storefront:edit-legal", { email })) {
      return { error: "You do not have permission to edit privacy / legal HTML." };
    }
    const privacy = privacyRaw ? validateAndSanitizeLegalHtml(privacyRaw) : { ok: true as const, html: "" };
    if (!privacy.ok) return { error: privacy.error };

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: {
        contactEmail: emailRaw || null,
        contactPhone: d.contactPhone?.trim() || null,
        privacyText: privacy.html ? privacy.html : null,
      },
    });
    revalidateStorefrontDashboardAndPublic(row.storeSlug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontBusinessSettingsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontBusinessSettings(formData));
}

const activeMenuOnlySchema = z.object({
  activeMenuId: z.string().uuid().optional().or(z.literal("")),
});

/** Set only the active menu (Menu tab shortcut) — requires an existing storefront row. */
export async function setStorefrontActiveMenu(formData: FormData) {
  try {
    const { sessionUser: user, userId } = await requireTenantActor();
    const parsed = activeMenuOnlySchema.safeParse({
      activeMenuId: formData.get("activeMenuId")?.toString(),
    });
    if (!parsed.success) return { error: "Invalid menu selection." };
    const menuRaw = (parsed.data.activeMenuId ?? "").trim();
    const menuId =
      menuRaw.length > 0 && /^[0-9a-f-]{36}$/i.test(menuRaw) ? menuRaw : null;
    if (menuId) {
      const menu = await prisma.menu.findFirst({
        where: { id: menuId, userId },
      });
      if (!menu) return { error: "Menu not found." };
      if (menu.catalogOnly) {
        return { error: "The item catalog cannot be the active storefront menu." };
      }
    }
    const row = await resolveOwnerStorefront(user.id);
    if (!row) return { error: "Save the storefront overview once first." };

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: { activeMenuId: menuId },
    });
    revalidateStorefrontDashboardAndPublic(row.storeSlug);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setStorefrontActiveMenuFormAction(formData: FormData): Promise<void> {
  void (await setStorefrontActiveMenu(formData));
}

export async function updateStorefrontStaffPermissions(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (profile?.role !== "OWNER") {
      return { error: "Only the workspace owner can change staff storefront permissions." };
    }
    const staffCanEditStorefront = formData.get("staffCanEditStorefront") === "on";
    const staffCanPublishStorefront = formData.get("staffCanPublishStorefront") === "on";
    const pagePublishWebhookUrl = String(formData.get("pagePublishWebhookUrl") ?? "").trim() || null;
    const pagePublishWebhookSecretRaw =
      String(formData.get("pagePublishWebhookSecret") ?? "").trim() || null;
    const row = await resolveOwnerStorefront(user.id);
    if (!row) return { error: "Save the storefront overview once first." };
    if (pagePublishWebhookSecretRaw && !isEncryptionConfigured()) {
      return {
        error:
          "Encryption is not configured. Set ENCRYPTION_KEY before saving a storefront webhook secret.",
      };
    }

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: {
        staffCanEditStorefront,
        staffCanPublishStorefront: staffCanEditStorefront ? staffCanPublishStorefront : false,
        pagePublishWebhookUrl,
        pagePublishWebhookSecret: encryptStorefrontWebhookSecret(
          pagePublishWebhookSecretRaw,
        ),
      },
    });
    revalidateStorefrontDashboardAndPublic(row.storeSlug);
    revalidatePath("/dashboard/storefront/settings");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontStaffPermissionsFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontStaffPermissions(formData));
}

export async function updateStorefrontThemeExperiment(formData: FormData) {
  try {
    const { sessionUser: user } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (profile?.role !== "OWNER") {
      return { error: "Only the workspace owner can change theme experiments." };
    }
    const row = await resolveOwnerStorefront(user.id);
    if (!row) return { error: "Save the storefront overview once first." };

    const enabled = formData.get("experimentEnabled") === "on";
    const pipelineEnabled = formData.getAll("pipelineEnabled").includes("on");
    const trafficPercent = Number(formData.get("trafficPercent") ?? 50);
    const draftPresetId = String(formData.get("draftPresetId") ?? "").trim() || undefined;

    const { getExperimentEnableCooldownBlock } = await import(
      "@/lib/storefront/theme-experiment-cooldown"
    );
    const cooldown = getExperimentEnableCooldownBlock(row.themeExperimentJson, enabled);
    if (cooldown) return { error: cooldown.message };

    const { buildThemeExperimentJsonForSave } = await import(
      "@/lib/storefront/theme-experiment-version"
    );
    const themeExperimentJson = buildThemeExperimentJsonForSave({
      enabled,
      pipelineEnabled,
      trafficPercent: Number.isFinite(trafficPercent)
        ? Math.min(100, Math.max(0, trafficPercent))
        : 50,
      draftPresetId,
      previousRaw: row.themeExperimentJson,
    });

    await prisma.storefrontSettings.update({
      where: { id: row.id },
      data: { themeExperimentJson },
    });

    const { enqueueThemeExperimentEdgeSync } = await import(
      "@/services/storefront/storefront-edge-sync-job-service"
    );
    const edgeJob = await enqueueThemeExperimentEdgeSync({
      storefrontId: row.id,
      storeSlug: row.storeSlug,
      themeExperimentJson,
    });
    const { isThemeExperimentEdgeStrict } = await import(
      "@/lib/storefront/theme-experiment-edge-strict"
    );
    if (edgeJob.error && isThemeExperimentEdgeStrict()) {
      return { error: edgeJob.error };
    }
    if (!edgeJob.synced && isThemeExperimentEdgeStrict()) {
      return {
        error:
          "Edge Config sync did not verify. Fix EDGE_CONFIG credentials or retry from Advanced.",
      };
    }
    if (!edgeJob.synced && process.env.THEME_EXPERIMENT_EDGE === "1") {
      logger.warn(
        "[storefront] Theme experiment saved; edge sync queued or retrying (job %s). App assigner remains active.",
        edgeJob.jobId,
      );
    }

    if (enabled && draftPresetId) {
      const { applyPresetToThemeDraftJson } = await import(
        "@/services/storefront/apply-theme-draft-preset-service"
      );
      await applyPresetToThemeDraftJson({ storefrontId: row.id, presetId: draftPresetId });
    }

    revalidateStorefrontDashboardAndPublic(row.storeSlug);
    revalidatePath("/dashboard/storefront/advanced");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateStorefrontThemeExperimentFormAction(formData: FormData): Promise<void> {
  void (await updateStorefrontThemeExperiment(formData));
}
