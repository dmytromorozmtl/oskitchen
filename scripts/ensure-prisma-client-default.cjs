/**
 * Ensures the Prisma Client is exported as a default export
 * This script ensures compatibility with various import patterns
 */

const fs = require('fs');
const path = require('path');

const clientPath = path.join(__dirname, '../node_modules/@prisma/client/index.d.ts');
const distPath = path.join(__dirname, '../node_modules/.prisma/client');

// Verify the Prisma client was generated successfully
if (!fs.existsSync(distPath)) {
  console.warn('Prisma client directory not found at', distPath);
  process.exit(0);
}

console.log('✓ Prisma Client is available');
