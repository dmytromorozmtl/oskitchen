import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { prisma } from "@/lib/prisma";
import { WorkspaceAccessDeniedError } from "@/lib/scope/assert-user-workspace-access";
import { assertResourceBelongsToUserOrWorkspace, scopedIdWhere } from "@/lib/scope/tenant-scope";

const run = process.env.RUN_DB_INTEGRATION === "1" && Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!run)("tenant isolation (orders)", () => {
  it("scopedIdWhere prevents cross-workspace order access by id", async () => {
    const suffix = randomUUID().slice(0, 8);
    const ownerA = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `tenant-a-${suffix}@example.com`,
        fullName: `Tenant A ${suffix}`,
        role: "OWNER",
      },
    });
    const ownerB = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `tenant-b-${suffix}@example.com`,
        fullName: `Tenant B ${suffix}`,
        role: "OWNER",
      },
    });

    const wsA = await prisma.workspace.create({
      data: { name: `WS A ${suffix}`, ownerUserId: ownerA.id },
    });
    const wsB = await prisma.workspace.create({
      data: { name: `WS B ${suffix}`, ownerUserId: ownerB.id },
    });

    const orderB = await prisma.order.create({
      data: {
        userId: ownerB.id,
        workspaceId: wsB.id,
        customerName: "Cross Tenant",
        customerEmail: `b-${suffix}@example.com`,
        total: 12.5,
        status: "PENDING",
        fulfillmentType: "PICKUP",
      },
    });

    const whereForA = scopedIdWhere({ userId: ownerA.id, workspaceId: wsA.id }, orderB.id);
    const leaked = await prisma.order.findFirst({ where: whereForA });
    expect(leaked).toBeNull();

    const direct = await prisma.order.findFirst({
      where: { id: orderB.id, userId: ownerA.id },
    });
    expect(direct).toBeNull();

    expect(() =>
      assertResourceBelongsToUserOrWorkspace(
        { userId: ownerA.id, workspaceId: wsA.id },
        { userId: ownerB.id, workspaceId: wsB.id },
      ),
    ).toThrow(WorkspaceAccessDeniedError);

    await prisma.order.delete({ where: { id: orderB.id } });
    await prisma.workspace.deleteMany({ where: { id: { in: [wsA.id, wsB.id] } } });
    await prisma.userProfile.deleteMany({ where: { id: { in: [ownerA.id, ownerB.id] } } });
  });

  it("prevents cross-tenant customer read by userId scope", async () => {
    const suffix = randomUUID().slice(0, 8);
    const ownerA = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `cust-a-${suffix}@example.com`,
        fullName: `A ${suffix}`,
        role: "OWNER",
      },
    });
    const ownerB = await prisma.userProfile.create({
      data: {
        id: randomUUID(),
        email: `cust-b-${suffix}@example.com`,
        fullName: `B ${suffix}`,
        role: "OWNER",
      },
    });

    const customerB = await prisma.kitchenCustomer.create({
      data: {
        userId: ownerB.id,
        email: `client-b-${suffix}@example.com`,
        name: "Client B",
        source: "MANUAL",
        type: "INDIVIDUAL",
        status: "NEW",
      },
    });

    const leaked = await prisma.kitchenCustomer.findFirst({
      where: { id: customerB.id, userId: ownerA.id },
    });
    expect(leaked).toBeNull();

    await prisma.kitchenCustomer.delete({ where: { id: customerB.id } });
    await prisma.userProfile.deleteMany({ where: { id: { in: [ownerA.id, ownerB.id] } } });
  });
});
