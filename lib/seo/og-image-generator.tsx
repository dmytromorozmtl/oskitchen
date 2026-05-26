import { ImageResponse } from 'next/og';

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export type OgImageOptions = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

/** Branded 1200×630 Open Graph image (KitchenOS palette). */
export function createOgImageResponse({ eyebrow, title, subtitle }: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 42%, #2563ff 100%)',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#93c5fd',
            }}
          >
            {eyebrow ?? 'KitchenOS'}
          </div>
          <div
            style={{
              fontSize: title.length > 48 ? 44 : 52,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                fontSize: 26,
                lineHeight: 1.35,
                opacity: 0.9,
                maxWidth: 920,
                marginTop: 8,
              }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 20,
            opacity: 0.85,
          }}
        >
          <span>os-kitchen.com</span>
          <span>14-day free trial</span>
        </div>
      </div>
    ),
    { ...OG_IMAGE_SIZE },
  );
}
