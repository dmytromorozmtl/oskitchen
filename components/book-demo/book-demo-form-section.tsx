'use client';

import {
  HubSpotEmbed,
  hasHubSpotPortal,
  hubSpotDemoFormId,
} from '@/components/marketing/hubspot-embed';

import { DemoRequestForm } from './demo-request-form';

export function BookDemoFormSection() {
  const formId = hubSpotDemoFormId();

  if (hasHubSpotPortal() && formId) {
    return (
      <div>
        <p className="mb-6 text-sm text-muted-foreground">
          Pick a time that works for your team — we confirm manually (no fake calendar slots).
        </p>
        <HubSpotEmbed formId={formId} />
      </div>
    );
  }

  return <DemoRequestForm />;
}
