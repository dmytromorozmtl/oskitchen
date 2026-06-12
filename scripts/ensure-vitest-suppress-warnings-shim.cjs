/**
 * Ensures Vitest warning suppression shim is available
 * This helps suppress known harmless warnings during test runs
 */

const fs = require('fs');
const path = require('path');

// Verify Vitest is installed
try {
  require.resolve('vitest');
  console.log('✓ Vitest is available');
} catch (e) {
  console.log('ℹ Vitest not installed, skipping warning suppression setup');
}
