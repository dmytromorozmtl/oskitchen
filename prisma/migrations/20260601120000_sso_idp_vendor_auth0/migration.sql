-- Add Auth0 as a supported enterprise SSO IdP vendor (SAML via Supabase Auth).
ALTER TYPE "SsoIdpVendor" ADD VALUE IF NOT EXISTS 'AUTH0';
