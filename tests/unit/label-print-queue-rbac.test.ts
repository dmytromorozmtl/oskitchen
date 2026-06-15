import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const recordAuditLog = vi.hoisted(() => vi.fn());
const labelTemplateCount = vi.hoisted(() => vi.fn());
const labelTemplateCreateMany = vi.hoisted(() => vi.fn());
const labelTemplateFindFirst = vi.hoisted(() => vi.fn());
const productFindFirst = vi.hoisted(() => vi.fn());
const printedLabelCreate = vi.hoisted(() => vi.fn());
const printedLabelFindFirst = vi.hoisted(() => vi.fn());
const printedLabelUpdate = vi.hoisted(() => vi.fn());
const appendLabelVerificationEvent = vi.hoisted(() => vi.fn());
const productByIdWhereForOwner = vi.hoisted(() => vi.fn());
const printedLabelByIdWhereForOwner = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/permissions/mutation-access", () => ({
  requireMutationPermission,
}));

vi.mock("@/lib/scope/require-tenant-actor", () => ({
  requireTenantActor,
}));

vi.mock("@/lib/audit-log", () => ({
  recordAuditLog,
}));

vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  productByIdWhereForOwner,
}));

vi.mock("@/lib/scope/workspace-printed-label-scope", () => ({
  printedLabelByIdWhereForOwner,
}));

vi.mock("@/services/nutrition-labels/label-verification-log", () => ({
  appendLabelVerificationEvent,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    labelTemplate: {
      count: labelTemplateCount,
      createMany: labelTemplateCreateMany,
      findFirst: labelTemplateFindFirst,
    },
    product: {
      findFirst: productFindFirst,
    },
    printedLabel: {
      create: printedLabelCreate,
      findFirst: printedLabelFindFirst,
      update: printedLabelUpdate,
    },
  },
}));

import {
  createPrintedLabelJobAction,
  ensureDefaultLabelTemplatesAction,
  markPrintedLabelJobAction,
} from "@/actions/label-print-queue";

const TEMPLATE_ID = "11111111-1111-4111-8111-111111111111";
const PRODUCT_ID = "22222222-2222-4222-8222-222222222222";
const LABEL_ID = "33333333-3333-4333-8333-333333333333";

const deniedActor = {
  sessionUserId: "staff-1",
  dataUserId: "owner-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "LINE_COOK" as const,
  email: "cook@example.com",
  granted: new Set<string>(),
};

describe("label print queue actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({
      sessionUser: { id: "manager-1" },
      dataUserId: "owner-1",
    });
    labelTemplateFindFirst.mockResolvedValue({ id: TEMPLATE_ID, type: "ITEM" });
    productFindFirst.mockResolvedValue({ id: PRODUCT_ID });
    productByIdWhereForOwner.mockResolvedValue({ userId: "owner-1", id: PRODUCT_ID });
    printedLabelCreate.mockResolvedValue({ id: LABEL_ID });
    printedLabelFindFirst.mockResolvedValue({
      id: LABEL_ID,
      productId: PRODUCT_ID,
    });
    printedLabelByIdWhereForOwner.mockResolvedValue({ userId: "owner-1", id: LABEL_ID });
    printedLabelUpdate.mockResolvedValue({});
    labelTemplateCount.mockResolvedValue(0);
    labelTemplateCreateMany.mockResolvedValue({ count: 3 });
    appendLabelVerificationEvent.mockResolvedValue(undefined);
  });

  it("denies create job without reports.read.audit and audits", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("templateId", TEMPLATE_ID);
    formData.set("productId", PRODUCT_ID);
    formData.set("copies", "1");

    const result = await createPrintedLabelJobAction(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(recordAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "nutrition_label_print.permission_denied",
        metadata: expect.objectContaining({
          operation: "nutrition_label_print.create_job",
          requiredPermission: "reports.read.audit",
        }),
      }),
    );
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(printedLabelCreate).not.toHaveBeenCalled();
  });

  it("allows create job when reports.read.audit is granted", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: true,
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("templateId", TEMPLATE_ID);
    formData.set("productId", PRODUCT_ID);
    formData.set("copies", "2");

    const result = await createPrintedLabelJobAction(formData);

    expect(result).toEqual({ ok: true });
    expect(printedLabelCreate).toHaveBeenCalled();
  });

  it("denies mark printed without reports.read.audit", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const formData = new FormData();
    formData.set("id", LABEL_ID);

    const result = await markPrintedLabelJobAction(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(printedLabelUpdate).not.toHaveBeenCalled();
  });

  it("denies ensure templates without reports.read.audit", async () => {
    requireMutationPermission.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
      actor: deniedActor,
    });

    const result = await ensureDefaultLabelTemplatesAction();

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireTenantActor).not.toHaveBeenCalled();
    expect(labelTemplateCreateMany).not.toHaveBeenCalled();
  });
});
