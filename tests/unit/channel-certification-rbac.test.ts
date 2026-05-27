import { beforeEach, describe, expect, it, vi } from "vitest";

const requireIntegrationsActor = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const prismaFindFirst = vi.hoisted(() => vi.fn());
const runChannelCertification = vi.hoisted(() => vi.fn());
const persistCertificationRecord = vi.hoisted(() => vi.fn());
const integrationConnectionByIdWhereForOwner = vi.hoisted(() => vi.fn());

vi.mock("@/lib/integrations/require-integrations-actor", () => ({
  requireIntegrationsActor,
}));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/lib/scope/workspace-resource-scope", () => ({
  integrationConnectionByIdWhereForOwner,
}));
vi.mock("@/services/integrations/channel-certification-runner", () => ({
  runChannelCertification,
  persistCertificationRecord,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    integrationConnection: {
      findFirst: prismaFindFirst,
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import {
  recordCertificationSignOffAction,
  runChannelCertificationAction,
} from "@/actions/channel-certification";

const connectionId = "11111111-1111-4111-8111-111111111111";

const wooConn = {
  id: connectionId,
  userId: "owner-1",
  provider: "WOOCOMMERCE",
  settingsJson: {
    certification: {
      provider: "woocommerce",
      lastRunAt: "2026-01-01T00:00:00.000Z",
      overall: "PASS",
      productStatus: "BETA",
      checks: [],
      signOff: {},
    },
  },
};

describe("channel certification actions RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireTenantActor.mockResolvedValue({ userId: "owner-1" });
    integrationConnectionByIdWhereForOwner.mockResolvedValue({ userId: "owner-1", id: connectionId });
    prismaFindFirst.mockResolvedValue(wooConn);
    runChannelCertification.mockResolvedValue({ overall: "PASS", checks: [], productStatus: "BETA" });
    persistCertificationRecord.mockResolvedValue(undefined);
  });

  it("denies run without integrations.manage", async () => {
    requireIntegrationsActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const formData = new FormData();
    formData.set("connectionId", connectionId);

    const result = await runChannelCertificationAction(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireIntegrationsActor).toHaveBeenCalledWith({
      operation: "channel_certification.run",
    });
    expect(runChannelCertification).not.toHaveBeenCalled();
  });

  it("denies sign-off without integrations.manage", async () => {
    requireIntegrationsActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const formData = new FormData();
    formData.set("connectionId", connectionId);
    formData.set("role", "engineering");

    const result = await recordCertificationSignOffAction(formData);

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireIntegrationsActor).toHaveBeenCalledWith({
      operation: "channel_certification.sign_off",
    });
    expect(persistCertificationRecord).not.toHaveBeenCalled();
  });

  it("allows run when integrations.manage is granted", async () => {
    requireIntegrationsActor.mockResolvedValue({ ok: true, actor: {}, workspaceId: "ws-1" });

    const formData = new FormData();
    formData.set("connectionId", connectionId);

    const result = await runChannelCertificationAction(formData);

    expect(result).toEqual({ ok: true, overall: "PASS" });
    expect(runChannelCertification).toHaveBeenCalledTimes(1);
  });

  it("allows sign-off when integrations.manage is granted", async () => {
    requireIntegrationsActor.mockResolvedValue({ ok: true, actor: {}, workspaceId: "ws-1" });

    const formData = new FormData();
    formData.set("connectionId", connectionId);
    formData.set("role", "engineering");

    const result = await recordCertificationSignOffAction(formData);

    expect(result).toEqual({ ok: true });
    expect(persistCertificationRecord).toHaveBeenCalledTimes(1);
  });
});
