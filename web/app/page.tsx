import { NavBar } from "@/components/NavBar";
import { Hero } from "@/components/Hero";
import { StatsStrip } from "@/components/StatsStrip";
import { UseCases } from "@/components/UseCases";
import { CodeSnippet } from "@/components/CodeSnippet";
import { InstallSection } from "@/components/InstallSection";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/components/LanguageProvider";

export default function Page() {
  return (
    <LanguageProvider>
      <NavBar />
      <main>
        <Hero />
        <StatsStrip />
        <UseCases />
        <CodeSnippet />
        <InstallSection />
        <Footer />
      </main>
    </LanguageProvider>
  );
}
