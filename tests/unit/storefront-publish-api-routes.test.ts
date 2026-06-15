import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionUser = vi.hoisted(() => vi.fn());
const requireStorefrontPublishActor = vi.hoisted(() => vi.fn());
const requireTenantActor = vi.hoisted(() => vi.fn());
const publishStorefrontThemeSnapshot = vi.hoisted(() => vi.fn());
const publishStorefrontHomeLayout = vi.hoisted(() => vi.fn());
const prismaFindFirst = vi.hoisted(() => vi.fn());

vi.mock("@/lib/auth", () => ({ getSessionUser }));
vi.mock("@/lib/storefront/require-storefront-actor", () => ({
  requireStorefrontPublishActor,
}));
vi.mock("@/lib/scope/require-tenant-actor", () => ({ requireTenantActor }));
vi.mock("@/services/storefront/storefront-theme-publish-service", () => ({
  publishStorefrontThemeSnapshot,
}));
vi.mock("@/services/storefront/storefront-page-builder-publish-service", () => ({
  publishStorefrontHomeLayout,
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    storefrontSettings: {
      findFirst: prismaFindFirst,
    },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { POST as postBuilderPublish } from "@/app/api/storefront/builder/publish/route";
import { POST as postThemePublish } from "@/app/api/storefront/theme/publish/route";

const storefrontId = "11111111-1111-4111-8111-111111111111";
const ownerUserId = "owner-user-1";
const sessionUser = { id: "staff-user-1", email: "staff@example.com" };

const actor = {
  sessionUserId: sessionUser.id,
  userId: ownerUserId,
  dataUserId: ownerUserId,
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "MARKETING" as const,
  email: sessionUser.email,
  granted: new Set(["storefront.publish"]),
};

function postJson(url: string, body: unknown) {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("storefront publish API routes RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSessionUser.mockResolvedValue(sessionUser);
    requireStorefrontPublishActor.mockResolvedValue({ ok: true, actor });
    requireTenantActor.mockResolvedValue({
      sessionUser,
      sessionUserId: sessionUser.id,
      userId: ownerUserId,
      dataUserId: ownerUserId,
      workspaceId: "ws-1",
    });
    prismaFindFirst.mockResolvedValue({
      id: storefrontId,
      storeSlug: "demo-store",
    });
    publishStorefrontThemeSnapshot.mockResolvedValue({ ok: true });
    publishStorefrontHomeLayout.mockResolvedValue({
      ok: true,
      publishedAt: "2026-05-27T12:00:00.000Z",
    });
  });

  it.each([
    {
      name: "theme publish",
      invoke: () => postThemePublish(postJson("http://localhost/api/storefront/theme/publish", { storefrontId })),
      operation: "storefront.theme_publish_api",
      route: "/api/storefront/theme/publish",
      publishMock: publishStorefrontThemeSnapshot,
    },
    {
      name: "builder publish",
      invoke: () => postBuilderPublish(postJson("http://localhost/api/storefront/builder/publish", { storefrontId })),
      operation: "storefront.builder_publish_api",
      route: "/api/storefront/builder/publish",
      publishMock: publishStorefrontHomeLayout,
    },
  ])("returns 401 when unauthenticated for $name", async ({ invoke, publishMock }) => {
    getSessionUser.mockResolvedValue(null);

    const response = await invoke();
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: "Unauthorized" });
    expect(requireStorefrontPublishActor).not.toHaveBeenCalled();
    expect(publishMock).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: "theme publish",
      invoke: () => postThemePublish(postJson("http://localhost/api/storefront/theme/publish", { storefrontId })),
      operation: "storefront.theme_publish_api",
      route: "/api/storefront/theme/publish",
      publishMock: publishStorefrontThemeSnapshot,
    },
    {
      name: "builder publish",
      invoke: () => postBuilderPublish(postJson("http://localhost/api/storefront/builder/publish", { storefrontId })),
      operation: "storefront.builder_publish_api",
      route: "/api/storefront/builder/publish",
      publishMock: publishStorefrontHomeLayout,
    },
  ])(
    "returns 403 and skips publish when storefront.publish is missing for $name",
    async ({ invoke, operation, route, publishMock }) => {
      requireStorefrontPublishActor.mockResolvedValue({
        ok: false,
        error: "You do not have permission to perform this action.",
      });

      const response = await invoke();
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json).toEqual({ error: "You do not have permission to perform this action." });
      expect(requireStorefrontPublishActor).toHaveBeenCalledWith({
        operation,
        metadata: { route, storefrontId },
      });
      expect(requireTenantActor).not.toHaveBeenCalled();
      expect(publishMock).not.toHaveBeenCalled();
    },
  );

  it.each([
    {
      name: "theme publish",
      invoke: () => postThemePublish(postJson("http://localhost/api/storefront/theme/publish", { storefrontId })),
      operation: "storefront.theme_publish_api",
      route: "/api/storefront/theme/publish",
      publishMock: publishStorefrontThemeSnapshot,
    },
    {
      name: "builder publish",
      invoke: () => postBuilderPublish(postJson("http://localhost/api/storefront/builder/publish", { storefrontId })),
      operation: "storefront.builder_publish_api",
      route: "/api/storefront/builder/publish",
      publishMock: publishStorefrontHomeLayout,
    },
  ])("returns 404 when storefront is outside tenant scope for $name", async ({ invoke, publishMock }) => {
    prismaFindFirst.mockResolvedValue(null);

    const response = await invoke();
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json).toEqual({ error: "Not found" });
    expect(prismaFindFirst).toHaveBeenCalledWith({
      where: { id: storefrontId, userId: ownerUserId },
      select: { id: true, storeSlug: true },
    });
    expect(publishMock).not.toHaveBeenCalled();
  });

  it("publishes theme snapshot for allowed tenant actor", async () => {
    const response = await postThemePublish(
      postJson("http://localhost/api/storefront/theme/publish", { storefrontId }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(publishStorefrontThemeSnapshot).toHaveBeenCalledWith({
      userId: ownerUserId,
      storefrontId,
    });
  });

  it("publishes builder layout for allowed tenant actor", async () => {
    const response = await postBuilderPublish(
      postJson("http://localhost/api/storefront/builder/publish", { storefrontId }),
    );
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true, publishedAt: "2026-05-27T12:00:00.000Z" });
    expect(publishStorefrontHomeLayout).toHaveBeenCalledWith({
      userId: ownerUserId,
      storefrontId,
    });
  });
});
