export function isOtelExportEnabled(): boolean {
  return Boolean(process.env.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()) && process.env.EXPERIMENT_OTEL !== "0";
}

let tracerInitialized = false;

export function markExperimentOtelInitialized(): void {
  tracerInitialized = true;
}

export function isExperimentOtelInitialized(): boolean {
  return tracerInitialized;
}
