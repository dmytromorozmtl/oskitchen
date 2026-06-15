import { describe, expect, it } from "vitest";

import {
  PUBLIC_API_V1_PATHS,
  PUBLIC_API_V1_RESOURCE_COUNT,
  PUBLIC_API_V1_RESOURCES,
  findPublicApiV1Resource,
} from "@/lib/api-public/public-api-v1-registry";

describe("public API v1 registry", () => {
  it("locks eight canonical v1 resources", () => {
    expect(PUBLIC_API_V1_RESOURCE_COUNT).toBe(8);
    expect(PUBLIC_API_V1_PATHS).toHaveLength(8);
  });

  it("maps orders to GET and POST with distinct rate limits", () => {
    const orders = findPublicApiV1Resource("orders");
    expect(orders.methods).toEqual(["GET", "POST"]);
    expect(orders.rateLimitPolicy).toBe("public_api_orders_get");
    expect(orders.postRateLimitPolicy).toBe("public_api_orders_post");
  });

  it("uses unique paths for every resource", () => {
    const paths = PUBLIC_API_V1_RESOURCES.map((resource) => resource.path);
    expect(new Set(paths).size).toBe(PUBLIC_API_V1_RESOURCES.length);
  });
});
