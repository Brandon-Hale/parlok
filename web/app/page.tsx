import { NavBar } from "@/components/NavBar";
import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { UseCases } from "@/components/UseCases";
import { CodeSnippet } from "@/components/CodeSnippet";
import { InstallSection } from "@/components/InstallSection";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";
import { JsonLd } from "@/components/JsonLd";
import {
  GITHUB_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Cross-platform",
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  license: "https://opensource.org/licenses/MIT",
  codeRepository: GITHUB_URL,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Brandon Hale",
    url: GITHUB_URL,
  },
};

export default function Page() {
  return (
    <LanguageProvider>
      <NavBar />
      <main>
        <Hero />
        <StatsStrip />
        <UseCases />
        <InstallSection />
        <CodeSnippet />
        <Footer />
      </main>
      <JsonLd data={softwareApplicationSchema} />
    </LanguageProvider>
  );
}
