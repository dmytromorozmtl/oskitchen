import type { Metadata } from 'next';

import { MealPrepSoftwareLanding } from '@/components/marketing/meal-prep-software-landing';
import {
  MEAL_PREP_SOFTWARE_LANDING_META,
  MEAL_PREP_SOFTWARE_LANDING_PATH,
} from '@/lib/marketing/meal-prep-software-landing-content';
import { marketingPageMetadata } from '@/lib/marketing/page-metadata';

export const metadata: Metadata = marketingPageMetadata({
  title: MEAL_PREP_SOFTWARE_LANDING_META.title,
  description: MEAL_PREP_SOFTWARE_LANDING_META.description,
  path: MEAL_PREP_SOFTWARE_LANDING_PATH,
  keywords: [...MEAL_PREP_SOFTWARE_LANDING_META.keywords],
});

export default function MealPrepSoftwareLandingPage() {
  return <MealPrepSoftwareLanding />;
}
