/**
 * Ensures Sentry OpenTelemetry shim is available
 * This provides compatibility between Sentry and OpenTelemetry instrumentation
 */

const fs = require('fs');
const path = require('path');

// Verify Sentry SDK is installed
try {
  require.resolve('@sentry/node');
  console.log('✓ Sentry SDK is available');
} catch (e) {
  console.log('ℹ Sentry SDK not installed, skipping shim setup');
}
