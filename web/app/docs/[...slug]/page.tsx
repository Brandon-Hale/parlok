import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllDocs, getDocBySlug } from "@/lib/docs";
import { DocsContent } from "@/components/DocsContent";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

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

  const url = `/docs/${doc.slug}`;
  return {
    title: doc.title,
    description: doc.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: `${doc.title} | ${SITE_NAME}`,
      description: doc.summary,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: `${doc.title} | ${SITE_NAME}`,
      description: doc.summary,
    },
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

  const url = `${SITE_URL}/docs/${doc.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: doc.title,
    description: doc.summary,
    url,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/parlok-logo.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  const breadcrumbItems = [
    { name: "Home", url: `${SITE_URL}/` },
    { name: "Docs", url: `${SITE_URL}/docs` },
  ];
  if (doc.section && doc.sectionSlug) {
    breadcrumbItems.push({
      name: doc.section,
      url: `${SITE_URL}/docs/${doc.sectionSlug}`,
    });
  }
  breadcrumbItems.push({ name: doc.title, url });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <DocsContent title={doc.title} summary={doc.summary} html={doc.html} />
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />
    </>
  );
}
