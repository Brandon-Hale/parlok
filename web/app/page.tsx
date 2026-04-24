import { Hero } from "@/components/Hero";
import { UseCases } from "@/components/UseCases";
import { CodeSnippet } from "@/components/CodeSnippet";
import { Footer } from "@/components/Footer";

export default function Page() {
  return (
    <main>
      <Hero />
      <UseCases />
      <CodeSnippet />
      <Footer />
    </main>
  );
}
