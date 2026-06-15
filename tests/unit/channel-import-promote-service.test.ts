import { describe, expect, it } from "vitest";

import { ChannelRecordValidationStatus } from "@prisma/client";

import { isChannelImportRecordApprovable } from "@/services/channels/channel-import-promote-service";

describe("channel-import-promote-service", () => {
  it("allows VALID and WARNING records for approval", () => {
    expect(isChannelImportRecordApprovable(ChannelRecordValidationStatus.VALID)).toBe(true);
    expect(isChannelImportRecordApprovable(ChannelRecordValidationStatus.WARNING)).toBe(true);
    expect(isChannelImportRecordApprovable(ChannelRecordValidationStatus.ERROR)).toBe(false);
    expect(isChannelImportRecordApprovable(ChannelRecordValidationStatus.NEEDS_MAPPING)).toBe(false);
  });
});
