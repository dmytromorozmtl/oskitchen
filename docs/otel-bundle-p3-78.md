# OpenTelemetry bundle analysis (P3-78)

**Policy:** `otel-bundle-p3-78-v1`  
**Status:** **DONE** — protobufjs bundle warning mitigated  
**Updated:** 2026-06-16

Gap closure: eliminate `@protobufjs/inquire` critical dependency warning from OpenTelemetry trace path by lazy-loading OTel SDK and externalizing packages on the server bundle.

## Problem

Production builds logged webpack critical dependency warnings when OpenTelemetry SDK modules (via `@protobufjs/inquire`) were bundled into hot paths like storefront experiment tracing.

## Mitigation

| Layer | Fix |
|-------|-----|
| **Lazy load** | `instrumentation.ts` → dynamic `initExperimentOtel()` only when `OTEL_EXPORTER_OTLP_ENDPOINT` set |
| **Span export** | `experiment-trace.ts` → dynamic import of `experiment-otel-span` |
| **SDK init** | `experiment-otel-init.ts` → dynamic imports for all `@opentelemetry/*` packages |
| **Server bundle** | `serverExternalPackages` in `next.config.ts` externalizes OTel stack |
| **Bundle analysis** | `@next/bundle-analyzer` enabled via `ANALYZE=true` |

## Commands

```bash
# CI gate
npm run check:otel-bundle-p3-78

# Local bundle analysis (writes .next/analyze/*.json)
npm run analyze
```

## Artifact

`artifacts/otel-bundle-p3-78.json`
