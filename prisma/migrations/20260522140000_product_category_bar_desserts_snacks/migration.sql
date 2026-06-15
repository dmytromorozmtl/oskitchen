-- Add product categories for daily-service menus (bar, desserts, snacks).
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'DESSERTS';
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'SNACKS';
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'BAR';
