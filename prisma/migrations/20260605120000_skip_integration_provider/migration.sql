-- Add Skip / Just Eat to integration provider enum for Canadian + UK marketplace ingest.
ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'SKIP';
