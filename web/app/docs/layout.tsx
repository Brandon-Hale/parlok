import { NavBar } from "@/components/NavBar";
import { DocsSidebar } from "@/components/DocsSidebar";
import { Footer } from "@/components/Footer";
import { getSidebarSections } from "@/lib/docs";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sections = await getSidebarSections();
  return (
    <>
      <NavBar />
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-20 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10 lg:gap-16">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <DocsSidebar sections={sections} />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
      <Footer />
    </>
  );
}
