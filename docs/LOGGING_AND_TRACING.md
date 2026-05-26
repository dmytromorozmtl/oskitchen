# Logging & Tracing

## In-app developer logs

- `/dashboard/developer/logs` lists `AuditLog` rows where:
  - `category = DEVELOPER`, or
  - `action` starts with `developer.`, or
  - `action` starts with `platform.incident`.

## Tracing

- Distributed tracing not yet wired — use `platform-analytics-service` placeholder until OpenTelemetry export is configured.

## Safety

- Metadata is passed through central `auditLog` redaction policies; never paste raw webhook bodies into audit metadata.
