"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import {
  GoLiveTestRunStatus,
  ImplementationTaskCategory,
  ImplementationTaskStatus,
  ImportStatus,
  ImportType,
  ProductMappingStatus,
} from "@prisma/client";

import { requireUserProfile } from "@/lib/auth";
import { asVoidFormAction } from "@/lib/actions/server-form-action";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";
import { validateImportCsvUpload } from "@/lib/upload-policy/media-upload-validation";
import { logUploadDenied } from "@/services/audit/upload-audit";
import {
  kitchenCustomerByIdWhereForOwner,
  kitchenCustomerListWhereForOwner,
} from "@/lib/scope/workspace-customer-scope";

import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";
import {
  confidenceScore,
  mappingJsonFromHeaders,
  validateImport,
  type ParsedCsvRow,
} from "@/lib/import-center";
import { whereOrdersForOwnerAnd } from "@/lib/analytics/revenue-metrics";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  productMappingByIdWhereForOwner,
  productMappingListWhereForOwner,
} from "@/lib/scope/workspace-product-mapping-scope";
import {
  menuListWhereForOwnerAnd,
  productByIdWhereForOwner,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { safeError } from "@/lib/security";

const DEFAULT_TASKS: Array<{ title: string; category: ImplementationTaskCategory; description: string }> = [
  { title: "Complete discovery call", category: "DISCOVERY", description: "Capture business model, current tools, volumes, and go-live window." },
  { title: "Validate CSV imports", category: "DATA", description: "Load product/customer/order samples and resolve row errors before production import." },
  { title: "Resolve product mappings", category: "MENU", description: "Confirm sales channel SKUs against KitchenOS menu items." },
  { title: "Connect sales channels", category: "INTEGRATIONS", description: "Connect WooCommerce/Shopify credentials or document manual export cadence." },
  { title: "Verify production workflow", category: "PRODUCTION", description: "Run a sample production day and confirm quantities." },
  { title: "Test packing labels", category: "PACKING", description: "Print labels and confirm scanner/packing flow with staff." },
  { title: "Train staff", category: "STAFF", description: "Complete kitchen, packing, manager, and owner training modules." },
  { title: "Confirm billing and support contacts", category: "BILLING", description: "Billing owner, support channel, and escalation contact confirmed." },
  { title: "Run go-live simulation", category: "LAUNCH", description: "Pass test run or document blockers before launch." },
];

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function nullableStr(formData: FormData, key: string): string | null {
  const value = str(formData, key);
  return value.length > 0 ? value : null;
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function jsonRows(value: unknown): ParsedCsvRow[] {
  if (!Array.isArray(value)) return [];
  return value.filter((row): row is ParsedCsvRow => row && typeof row === "object" && !Array.isArray(row));
}

export async function createImplementationProject(formData: FormData) {
  try {
    const { dataUserId } = await requireTenantActor();
    const user = await requireUserProfile();
    const businessName = str(formData, "businessName") || user.companyName || "Implementation project";
    const project = await prisma.implementationProject.create({
      data: {
        userId: dataUserId,
        businessName,
        businessType: nullableStr(formData, "businessType"),
        assignedOwner: nullableStr(formData, "assignedOwner"),
        targetGoLiveDate: parseDate(nullableStr(formData, "targetGoLiveDate")),
        currentPlatform: nullableStr(formData, "currentPlatform"),
        weeklyOrderVolume: Number(str(formData, "weeklyOrderVolume")) || null,
        notes: nullableStr(formData, "notes"),
        status: "DISCOVERY",
        tasks: {
          create: DEFAULT_TASKS.map((task) => ({
            ...task,
            status: "TODO",
            priority: task.category === "LAUNCH" ? "HIGH" : "MEDIUM",
          })),
        },
      },
    });
    revalidatePath("/dashboard/implementation");
    return { ok: true as const, projectId: project.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateImplementationTaskStatus(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();
    const taskId = str(formData, "taskId");
    const status = str(formData, "status") as ImplementationTaskStatus;
    if (!Object.values(ImplementationTaskStatus).includes(status)) return { error: "Invalid status" };

    const task = await prisma.implementationTask.findFirst({
      where: { id: taskId, project: { userId: dataUserId } },
    });
    if (!task) return { error: "Task not found" };

    await prisma.implementationTask.update({
      where: { id: task.id },
      data: { status, completedAt: status === "DONE" ? new Date() : null },
    });
    revalidatePath("/dashboard/implementation");
    revalidatePath("/dashboard/go-live");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createImportJobFromCsv(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();
    const type = str(formData, "type") as ImportType;
    if (!Object.values(ImportType).includes(type)) return { error: "Invalid import type" };

    const upload = formData.get("file");
    if (!(upload instanceof File)) return { error: "Upload a CSV file" };
    const csvBytes = new Uint8Array(await upload.arrayBuffer());
    const csvValidated = validateImportCsvUpload({
      bytes: csvBytes,
      filename: upload.name || `${type.toLowerCase()}.csv`,
    });
    if (!csvValidated.ok) {
      void logUploadDenied({
        channel: "import_csv",
        actorUserId: user.id,
        workspaceId,
        entity: { type: "ImportJob", id: type },
        mimeType: "text/csv",
        sizeBytes: csvBytes.byteLength,
        reason: csvValidated.error,
      });
      return { error: csvValidated.error };
    }

    const safe = await enforceUploadContentSafety({
      bytes: csvBytes,
      mimeType: "text/csv",
      channel: "import_csv",
      actorUserId: user.id,
      workspaceId,
      entity: { type: "ImportJob", id: type },
      metadata: { filename: upload.name || `${type.toLowerCase()}.csv` },
    });
    if (!safe.ok) {
      return { error: safe.error };
    }
    const csvText = new TextDecoder("utf-8", { fatal: false }).decode(csvBytes);
    const validated = validateImport(type, csvText);

    const job = await prisma.importJob.create({
      data: {
        userId: dataUserId,
        workspaceId: workspaceId ?? undefined,
        type,
        filename: upload.name || `${type.toLowerCase()}.csv`,
        status: validated.errors.length > 0 ? "MAPPING" : "VALIDATED",
        totalRows: validated.rows.length,
        validRows: validated.validRows.length,
        errorRows: validated.errors.length,
        mappingJson: mappingJsonFromHeaders(validated.headers),
        resultJson: {
          headers: validated.headers,
          validRows: validated.validRows,
          previewRows: validated.rows.slice(0, 25),
        },
        rowErrors: {
          create: validated.errors.slice(0, 500).map((error) => ({
            rowNumber: error.rowNumber,
            field: error.field,
            message: error.message,
            rawRowJson: error.rawRow,
          })),
        },
        stagedOrders:
          type === "ORDERS"
            ? {
                create: validated.validRows.map((row, index) => ({
                  rowNumber: index + 2,
                  externalRef: row.order_number || null,
                  status: "NEEDS_MAPPING",
                  issueSummary: "Order staged pending product mapping and fulfillment review.",
                  rawRowJson: row,
                  impactJson: {
                    revenue: Number(row.total || row.price || 0),
                    fulfillmentDate: row.fulfillment_date,
                  },
                })),
              }
            : undefined,
      },
    });

    revalidatePath("/dashboard/import-center");
    return { ok: true as const, jobId: job.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function commitImportJob(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();
    const jobId = str(formData, "jobId");
    const job = await prisma.importJob.findFirst({ where: { id: jobId, userId: dataUserId } });
    if (!job) return { error: "Import job not found" };
    if (job.errorRows > 0) return { error: "Resolve row errors before importing" };
    if (job.status === ImportStatus.IMPORTED) return { error: "Import already completed" };

    const result = job.resultJson as { validRows?: unknown } | null;
    const rows = jsonRows(result?.validRows);
    let imported = 0;

    if (job.type === "CUSTOMERS") {
      for (const row of rows) {
        await prisma.kitchenCustomer.upsert({
          where: { userId_email: { userId: dataUserId, email: row.email.toLowerCase() } },
          update: { name: row.name || undefined, phone: row.phone || undefined },
          create: {
            userId: dataUserId,
            workspaceId,
            email: row.email.toLowerCase(),
            name: row.name || null,
            phone: row.phone || null,
            source: "IMPORT",
          },
        });
        imported += 1;
      }
    } else if (job.type === "STAFF") {
      for (const row of rows) {
        await prisma.staffMember.create({
          data: { userId: dataUserId, name: row.name, email: row.email || null, role: row.role || "staff" },
        });
        imported += 1;
      }
    } else if (job.type === "INGREDIENTS") {
      for (const row of rows) {
        await prisma.ingredient.create({
          data: {
            userId: dataUserId,
            name: row.name,
            unit: row.unit,
            supplier: row.supplier || null,
            costPerUnit: row.cost_per_unit || "0",
            currentStock: row.current_stock || "0",
            parLevel: row.par_level || "0",
          },
        });
        imported += 1;
      }
    } else if (job.type === "PRODUCTS") {
      await ensureCatalogMenu(user.id);
      const serviceActive = await prisma.menu.findFirst({
        where: await menuListWhereForOwnerAnd(dataUserId, { active: true, catalogOnly: false }),
        orderBy: { createdAt: "desc" },
      });
      const catalogMenu = await prisma.menu.findFirst({
        where: await menuListWhereForOwnerAnd(dataUserId, { catalogOnly: true }),
      });
      const targetMenu = serviceActive ?? catalogMenu;
      if (!targetMenu) {
        return { error: "Could not resolve a menu for imported products." };
      }
      for (const row of rows) {
        const workspaceId = await resolveOwnerWorkspaceId(dataUserId);
        const product = await prisma.product.create({
          data: {
            menuId: targetMenu.id,
            workspaceId: workspaceId ?? undefined,
            title: row.title,
            price: row.price.replace(/[$,]/g, ""),
            preparedDate: new Date(row.prepared_date),
            pickupDate: row.pickup_date ? new Date(row.pickup_date) : null,
            description: row.description || null,
            allergens: row.allergens || null,
            active: true,
          },
        });
        await prisma.productionTask.create({ data: { productId: product.id } });
        imported += 1;
      }
    } else {
      return { error: `${job.type} imports are validated and staged, not committed automatically yet` };
    }

    await prisma.importJob.update({
      where: { id: job.id },
      data: { status: "IMPORTED", completedAt: new Date(), resultJson: { ...(job.resultJson as object), imported } },
    });
    revalidatePath("/dashboard/import-center");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/customers");
    return { ok: true as const, imported };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createProductMappingSuggestion(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();
    const provider = str(formData, "provider") || "CSV";
    const externalTitle = str(formData, "externalTitle");
    const externalProductId = str(formData, "externalProductId") || externalTitle;
    const externalSku = nullableStr(formData, "externalSku");
    if (!externalTitle) return { error: "External title is required" };

    const products = await prisma.product.findMany({
      where: await productListWhereForOwner(dataUserId),
      select: { id: true, title: true },
      take: 200,
    });
    const best = products
      .map((product) => ({ product, score: confidenceScore(externalTitle, externalSku, product) }))
      .sort((a, b) => b.score - a.score)[0];

    await prisma.productMapping.upsert({
      where: {
        userId_provider_externalProductId_externalVariantId: {
          userId: dataUserId,
          provider,
          externalProductId,
          externalVariantId: str(formData, "externalVariantId") || "",
        },
      },
      update: {
        ...(workspaceId ? { workspaceId } : {}),
        externalTitle,
        externalSku,
        internalProductId: best?.score >= 0.5 ? best.product.id : null,
        confidence: best?.score ?? 0,
        status: best?.score >= 0.8 ? "SUGGESTED" : "NEEDS_REVIEW",
      },
      create: {
        userId: dataUserId,
        workspaceId: workspaceId ?? undefined,
        provider,
        externalProductId,
        externalVariantId: str(formData, "externalVariantId") || "",
        externalTitle,
        externalSku,
        internalProductId: best?.score >= 0.5 ? best.product.id : null,
        confidence: best?.score ?? 0,
        status: best?.score >= 0.8 ? "SUGGESTED" : "NEEDS_REVIEW",
      },
    });
    revalidatePath("/dashboard/product-mapping");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateProductMappingStatus(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();
    const mappingId = str(formData, "mappingId");
    const status = str(formData, "status") as ProductMappingStatus;
    if (!Object.values(ProductMappingStatus).includes(status)) return { error: "Invalid mapping status" };
    const productId = nullableStr(formData, "internalProductId");
    if (productId) {
      const product = await prisma.product.findFirst({
        where: await productByIdWhereForOwner(dataUserId, productId),
      });
      if (!product) return { error: "Product not found" };
    }
    await prisma.productMapping.updateMany({
      where: await productMappingByIdWhereForOwner(dataUserId, mappingId),
      data: { status, internalProductId: productId },
    });
    revalidatePath("/dashboard/product-mapping");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function mergeCustomers(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();
    const primaryCustomerId = str(formData, "primaryCustomerId");
    const mergedCustomerIds = str(formData, "mergedCustomerIds")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .filter((id) => id !== primaryCustomerId);
    if (!primaryCustomerId || mergedCustomerIds.length === 0) return { error: "Choose a primary and duplicate customer" };

    const primary = await prisma.kitchenCustomer.findFirst({
      where: await kitchenCustomerByIdWhereForOwner(dataUserId, primaryCustomerId),
    });
    if (!primary) return { error: "Primary customer not found" };
    const customerScope = await kitchenCustomerListWhereForOwner(dataUserId);
    const duplicates = await prisma.kitchenCustomer.findMany({
      where: { AND: [customerScope, { id: { in: mergedCustomerIds } }] },
    });
    if (duplicates.length !== mergedCustomerIds.length) return { error: "Duplicate customer not found" };

    await prisma.$transaction([
      prisma.customerSubscription.updateMany({
        where: { userId: dataUserId, customerId: { in: mergedCustomerIds } },
        data: { customerId: primaryCustomerId },
      }),
      prisma.customerMergeEvent.create({
        data: {
          userId: dataUserId,
          primaryCustomerId,
          mergedCustomerIdsJson: mergedCustomerIds,
          performedBy: user.email,
        },
      }),
      prisma.kitchenCustomer.deleteMany({
        where: { AND: [customerScope, { id: { in: mergedCustomerIds } }] },
      }),
    ]);
    revalidatePath("/dashboard/customers/deduplication");
    revalidatePath("/dashboard/customers");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function runGoLiveTestRun(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId, workspaceId } = await requireTenantActor();
    const mappingWhere = await productMappingListWhereForOwner(dataUserId);
    const [orders, missingMappings, staffCount, openTasks] = await Promise.all([
      prisma.order.count({
        where: await whereOrdersForOwnerAnd(dataUserId, {
          status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
        }),
      }),
      prisma.productMapping.count({
        where: { AND: [mappingWhere, { status: { in: ["NEEDS_REVIEW", "SUGGESTED"] } }] },
      }),
      prisma.staffMember.count({ where: { userId: dataUserId, active: true } }),
      prisma.implementationTask.count({ where: { project: { userId: dataUserId }, status: { in: ["TODO", "IN_PROGRESS", "BLOCKED"] } } }),
    ]);
    const blockers = [
      missingMappings > 0 ? `${missingMappings} product mappings need review` : null,
      staffCount === 0 ? "No active staff members are configured" : null,
      openTasks > 3 ? `${openTasks} implementation tasks are still open` : null,
    ].filter(Boolean);
    const status: GoLiveTestRunStatus = blockers.length > 0 ? "NEEDS_REVIEW" : "PASSED";
    await prisma.goLiveTestRun.create({
      data: {
        userId: dataUserId,
        status,
        resultJson: {
          selectedOrders: str(formData, "selectedOrders") || "current open orders",
          orderCount: orders,
          missingMappings,
          staffCount,
          openTasks,
          blockers,
          warnings: orders === 0 ? ["No live orders selected; use a training order for a fuller simulation."] : [],
        },
      },
    });
    revalidatePath("/dashboard/go-live/test-run");
    revalidatePath("/dashboard/go-live");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export const mergeCustomersFormAction = asVoidFormAction(mergeCustomers);
export const runGoLiveTestRunFormAction = asVoidFormAction(runGoLiveTestRun);
