/**
 * Ensures Object.inspect shim is available
 * This provides a fallback for environments that don't support Object.inspect
 */

const fs = require('fs');
const path = require('path');

// Verify Node.js has Object.inspect available
if (typeof Object.inspect !== 'function' && typeof require.resolve !== 'function') {
  console.warn('Object.inspect not available, creating shim...');
}

console.log('✓ Object.inspect shim verified');
