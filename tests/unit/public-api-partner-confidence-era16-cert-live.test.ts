import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CANONICAL_DOC_PATHS,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CANONICAL_MARKERS,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CERT_SCRIPT,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CI_SCRIPTS,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DEVELOPER_DOC,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DEVELOPER_DOC_SECTIONS,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_FORBIDDEN_CLAIMS,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LIVE_SMOKE_SCRIPT,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_MODULE,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_REVIEW_SECTION,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_SUMMARY_ARTIFACT,
  PUBLIC_API_PARTNER_CONFIDENCE_ERA16_UNIT_TESTS,
} from "@/lib/api-public/public-api-partner-confidence-era16-policy";
import { buildOpenApiDocument } from "@/lib/api/openapi-spec";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("public API partner confidence era16 CI certification (live repo)", () => {
  it("locks era16 public API partner confidence policy id", () => {
    expect(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID).toBe(
      "era16-public-api-partner-confidence-v1",
    );
  });

  it("defines era16 scripts chained into public-api-v1 cert", () => {
    const scripts = readPackageScripts();
    for (const name of PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["cert:public-api-partner-confidence-era16"]).toContain(
      PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CERT_SCRIPT,
    );
    expect(scripts["smoke:public-api-live"]).toContain(
      PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LIVE_SMOKE_SCRIPT,
    );
    expect(scripts["test:ci:public-api-v1:cert"]).toContain(
      "test:ci:public-api-partner-confidence-era16:cert",
    );
  });

  it("wires partner confidence module, cert script, and summary artifact", () => {
    expect(existsSync(join(ROOT, PUBLIC_API_PARTNER_CONFIDENCE_ERA16_MODULE))).toBe(true);
    expect(existsSync(join(ROOT, PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CERT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, PUBLIC_API_PARTNER_CONFIDENCE_ERA16_LIVE_SMOKE_SCRIPT))).toBe(
      true,
    );
  });

  it("documents bearer auth on public v1 routes in OpenAPI", () => {
    const doc = buildOpenApiDocument();
    const schemes = doc.components as { securitySchemes?: Record<string, unknown> } | undefined;
    expect(schemes?.securitySchemes?.bearerApiKey).toBeTruthy();
    const paths = doc.paths as Record<string, Record<string, { security?: unknown[] }>>;
    const ordersGet = paths["/api/public/v1/orders"]?.get;
    expect(ordersGet?.security).toEqual([{ bearerApiKey: [] }]);
  });

  it("documents era16 partner confidence in canonical docs", () => {
    const developerDoc = readFileSync(
      join(ROOT, PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DEVELOPER_DOC),
      "utf8",
    );
    for (const section of PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DEVELOPER_DOC_SECTIONS) {
      expect(developerDoc, `missing ${section}`).toContain(`## ${section}`);
    }
    expect(developerDoc).toContain(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_REVIEW_SECTION);

    for (const rel of PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID.toLowerCase());
      if (rel === PUBLIC_API_PARTNER_CONFIDENCE_ERA16_DEVELOPER_DOC) continue;
      for (const forbidden of PUBLIC_API_PARTNER_CONFIDENCE_ERA16_FORBIDDEN_CLAIMS) {
        expect(text, `${rel} forbidden: ${forbidden}`).not.toContain(forbidden.toLowerCase());
      }
      for (const marker of PUBLIC_API_PARTNER_CONFIDENCE_ERA16_CANONICAL_MARKERS) {
        if (marker.includes("/")) continue;
        expect(text, `${rel} missing ${marker}`).toContain(marker.toLowerCase());
      }
    }

    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_POLICY_ID);
    for (const rel of PUBLIC_API_PARTNER_CONFIDENCE_ERA16_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
    expect(PUBLIC_API_PARTNER_CONFIDENCE_ERA16_SUMMARY_ARTIFACT).toBe(
      "artifacts/public-api-partner-confidence-summary.json",
    );
  });
});
