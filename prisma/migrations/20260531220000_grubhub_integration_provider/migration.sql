-- Add Grubhub to integration provider enum for marketplace sync + order import.
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'GRUBHUB';
