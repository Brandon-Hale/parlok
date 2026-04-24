import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeShiki from "@shikijs/rehype";
import rehypeStringify from "rehype-stringify";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export type DocMeta = {
  /** Full slug path, e.g. "introduction" or "getting-started/install". */
  slug: string;
  /** Same slug split on "/" — handy for Next's catch-all route params. */
  slugPath: string[];
  title: string;
  summary?: string;
  order: number;
  /** Optional section label (taken from the immediate parent folder). */
  section: string | null;
  sectionSlug: string | null;
  sectionOrder: number;
};

export type Doc = DocMeta & {
  html: string;
};

export type SidebarSection = {
  title: string | null;
  slug: string | null;
  order: number;
  docs: DocMeta[];
};

type Raw = {
  meta: DocMeta;
  absPath: string;
  body: string;
};

function parseOrderedName(name: string): { order: number; cleanName: string } {
  const match = name.match(/^(\d+)[-_](.+)$/);
  if (match) return { order: parseInt(match[1], 10), cleanName: match[2] };
  return { order: 999, cleanName: name };
}

function titleCase(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

async function walk(
  dir: string,
  section: { title: string; slug: string; order: number } | null,
): Promise<Raw[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const docs: Raw[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
    const abs = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const { order, cleanName } = parseOrderedName(entry.name);
      const nested = await walk(abs, {
        title: titleCase(cleanName),
        slug: cleanName,
        order,
      });
      docs.push(...nested);
      continue;
    }

    if (!entry.name.endsWith(".md")) continue;

    const raw = await fs.readFile(abs, "utf8");
    const parsed = matter(raw);
    const data = parsed.data as {
      slug?: string;
      title?: string;
      summary?: string;
      order?: number;
    };
    if (!data.title) {
      throw new Error(`Doc ${abs} is missing required frontmatter field: title.`);
    }

    const base = entry.name.replace(/\.md$/, "");
    const { order: fileOrder, cleanName } = parseOrderedName(base);
    const leafSlug = data.slug ?? cleanName;
    const fullSlug = section ? `${section.slug}/${leafSlug}` : leafSlug;

    const meta: DocMeta = {
      slug: fullSlug,
      slugPath: fullSlug.split("/"),
      title: data.title,
      summary: data.summary,
      order: data.order ?? fileOrder,
      section: section?.title ?? null,
      sectionSlug: section?.slug ?? null,
      sectionOrder: section?.order ?? -1,
    };

    docs.push({ meta, absPath: abs, body: parsed.content });
  }

  return docs;
}

async function readAllRaw(): Promise<Raw[]> {
  try {
    await fs.access(DOCS_DIR);
  } catch {
    return [];
  }
  const all = await walk(DOCS_DIR, null);
  return all.sort((a, b) => {
    if (a.meta.sectionOrder !== b.meta.sectionOrder) {
      return a.meta.sectionOrder - b.meta.sectionOrder;
    }
    return a.meta.order - b.meta.order;
  });
}

export async function getAllDocs(): Promise<DocMeta[]> {
  const docs = await readAllRaw();
  return docs.map((d) => d.meta);
}

export async function getSidebarSections(): Promise<SidebarSection[]> {
  const docs = await getAllDocs();
  const map = new Map<string, SidebarSection>();

  for (const doc of docs) {
    const key = doc.sectionSlug ?? "__root__";
    if (!map.has(key)) {
      map.set(key, {
        title: doc.section,
        slug: doc.sectionSlug,
        order: doc.sectionOrder,
        docs: [],
      });
    }
    map.get(key)!.docs.push(doc);
  }

  const sections = Array.from(map.values());
  sections.sort((a, b) => a.order - b.order);
  for (const s of sections) s.docs.sort((a, b) => a.order - b.order);
  return sections;
}

export async function getDocBySlug(slug: string): Promise<Doc | null> {
  const docs = await readAllRaw();
  const found = docs.find((d) => d.meta.slug === slug);
  if (!found) return null;

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeShiki, { theme: "github-light" })
    .use(rehypeStringify)
    .process(found.body);

  return {
    ...found.meta,
    html: String(processed),
  };
}
