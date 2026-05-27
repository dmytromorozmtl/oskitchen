import { beforeEach, describe, expect, it, vi } from "vitest";

const requireChannelManageActor = vi.hoisted(() => vi.fn());
const requireIntegrationsReadActor = vi.hoisted(() => vi.fn());
const requireChannelActor = vi.hoisted(() => vi.fn());

vi.mock("@/lib/channels/require-channel-manage-actor", () => ({
  requireChannelManageActor,
}));

vi.mock("@/lib/integrations/require-integrations-actor", () => ({
  requireIntegrationsReadActor,
}));

vi.mock("@/lib/channels/require-channel-actor", () => ({
  requireChannelActor,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    channelImportRecord: { findMany: vi.fn().mockResolvedValue([]) },
    channelImportBatchRelationWhere: vi.fn(),
  },
}));

vi.mock("@/lib/scope/channel-import-scope", () => ({
  channelImportBatchRelationWhere: vi.fn().mockResolvedValue({}),
}));

import {
  approveChannelImportRecords,
  exportChannelImportErrorCsv,
  runChannelIngestSimulation,
} from "@/actions/channel-command-center";

describe("channel-command-center RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("denies import approval without integrations.manage", async () => {
    requireChannelManageActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const result = await approveChannelImportRecords({ recordIds: ["rec-1"] });

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireChannelManageActor).toHaveBeenCalledWith({
      operation: "channel.import.approve",
      metadata: { recordCount: 1 },
    });
  });

  it("denies simulator runs without integrations.manage", async () => {
    requireChannelManageActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to perform this action.",
    });

    const result = await runChannelIngestSimulation({ scenario: "duplicate_order" });

    expect(result).toEqual({ error: "You do not have permission to perform this action." });
    expect(requireChannelManageActor).toHaveBeenCalledWith(
      expect.objectContaining({ operation: "channel.simulator.run" }),
    );
  });

  it("requires integrations.read for error CSV export", async () => {
    requireIntegrationsReadActor.mockResolvedValue({
      ok: false,
      error: "You do not have permission to view integrations.",
    });

    const result = await exportChannelImportErrorCsv("batch-1");

    expect(result).toEqual({ error: "You do not have permission to view integrations." });
    expect(requireChannelActor).not.toHaveBeenCalled();
  });
});
