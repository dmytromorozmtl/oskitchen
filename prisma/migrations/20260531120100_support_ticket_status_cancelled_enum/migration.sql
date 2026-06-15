-- Idempotent: some databases never received CANCELLED on SupportTicketStatus (partial deploy / skipped migration).
ALTER TYPE "SupportTicketStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
