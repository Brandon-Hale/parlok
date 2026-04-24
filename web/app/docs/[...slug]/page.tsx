import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDocs, getDocBySlug } from "@/lib/docs";
import { DocsContent } from "@/components/DocsContent";

export async function generateStaticParams() {
  const docs = await getAllDocs();
  return docs.map((d) => ({ slug: d.slugPath }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getDocBySlug(slug.join("/"));
  if (!doc) return {};
  return {
    title: `${doc.title} · parlok docs`,
    description: doc.summary,
  };
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const doc = await getDocBySlug(slug.join("/"));
  if (!doc) notFound();

  return <DocsContent title={doc.title} summary={doc.summary} html={doc.html} />;
}
