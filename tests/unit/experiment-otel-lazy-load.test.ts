import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("OTEL lazy-load (protobufjs warning fix)", () => {
  it("keeps experiment-trace free of static OpenTelemetry imports", () => {
    const trace = readFileSync(join(ROOT, "lib/storefront/experiment-trace.ts"), "utf8");
    expect(trace).not.toContain("@opentelemetry/");
    expect(trace).not.toContain("experiment-otel-init");
    expect(trace).toContain('import("@/lib/observability/experiment-otel-span")');
  });

  it("initializes OTEL only from instrumentation when export env is set", () => {
    const instrumentation = readFileSync(join(ROOT, "instrumentation.ts"), "utf8");
    expect(instrumentation).toContain("experiment-otel-init");
    expect(instrumentation).toContain("OTEL_EXPORTER_OTLP_ENDPOINT");
    expect(instrumentation).not.toContain("experiment-otel-span");
  });

  it("externalizes OpenTelemetry packages on the server bundle", () => {
    const nextConfig = readFileSync(join(ROOT, "next.config.ts"), "utf8");
    expect(nextConfig).toContain("@opentelemetry/exporter-trace-otlp-http");
    expect(nextConfig).toContain("@opentelemetry/otlp-transformer");
  });

  it("isolates trace URL helpers from OTEL SDK modules", () => {
    const urlModule = readFileSync(join(ROOT, "lib/observability/experiment-otel-url.ts"), "utf8");
    expect(urlModule).not.toContain("@opentelemetry");
  });
});
