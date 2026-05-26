import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { SignupForm } from '@/components/auth/signup-form';
import { ConversionTrustBadges } from '@/components/marketing/conversion-trust-badges';
import { ThemeToggle } from '@/components/theme-toggle';
import { getSessionUser } from '@/lib/auth';
import { APP_NAME } from '@/lib/constants';
import { SIGNUP_MARKETING } from '@/lib/marketing/signup-marketing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';
import { prisma } from '@/lib/prisma';
import { defaultPostAuthPath } from '@/lib/role-navigation';

export const metadata = marketingPageMetadata({
  title: 'Start Free Trial — KitchenOS',
  description:
    'Create your KitchenOS workspace. 14-day trial, no credit card. POS and kitchen operations for restaurants, meal prep, and catering.',
  path: '/signup',
  noIndex: true,
});

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) {
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      select: { role: true, onboardingCompleted: true },
    });
    redirect(
      defaultPostAuthPath(
        profile?.role ?? 'OWNER',
        Boolean(profile?.onboardingCompleted),
      ),
    );
  }

  const cookieStore = await cookies();
  const referralCode = cookieStore.get('kos_ref')?.value ?? '';
  const copy = SIGNUP_MARKETING;

  return (
    <div className="relative min-h-screen bg-muted/30">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-16">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-xs font-bold text-white">
              K
            </span>
            {APP_NAME}
          </Link>
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
            <Link key={link.href} href={link.href} className="font-medium text-primary hover:underline">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
