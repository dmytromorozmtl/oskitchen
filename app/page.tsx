import { HomeLanding } from "@/components/marketing/home-landing";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <HomeLanding />
      <SiteFooter />
    </div>
  );
}
