import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { SignupForm } from '@/components/auth/signup-form';
import { ConversionTrustBadges } from '@/components/marketing/conversion-trust-badges';
import { OSKitchenLogo } from '@/components/ui/os-kitchen-logo';
import { getSessionUser } from '@/lib/auth';
import { SIGNUP_MARKETING } from '@/lib/marketing/signup-marketing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { A11Y_INLINE_LINK } from '@/lib/a11y/ui-classes';
import { resolvePostAuthPathForSessionUser } from '@/lib/navigation/resolve-operator-post-auth-path';

export const metadata = marketingPageMetadata({
  title: 'Start Free Trial — OS Kitchen',
  description:
    'Create your OS Kitchen workspace. 14-day trial, no credit card. One screen for orders, kitchen, and delivery.',
  path: '/signup',
  noIndex: true,
});

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) {
    redirect(await resolvePostAuthPathForSessionUser(user.id));
  }

  const cookieStore = await cookies();
  const referralCode = cookieStore.get('kos_ref')?.value ?? '';
  const copy = SIGNUP_MARKETING;

  return (
    <div className="relative min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <OSKitchenLogo href="/" size="lg" className="inline-flex" />
          <h1 className="mt-6 text-2xl font-bold tracking-tight">{copy.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.subtitle}</p>
          <div className="mt-5">
            <ConversionTrustBadges badges={copy.trustBadges} />
          </div>
        </div>
        <div className="rounded-2xl border border-border/80 bg-card/90 p-8 shadow-lg backdrop-blur">
          <Suspense fallback={null}>
            <SignupForm initialReferralCode={referralCode} />
          </Suspense>
        </div>
        <nav className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-sm text-muted-foreground">
          {copy.footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className={A11Y_INLINE_LINK}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
