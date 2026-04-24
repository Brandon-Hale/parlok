import { redirect } from "next/navigation";
import { getAllDocs } from "@/lib/docs";

export default async function DocsIndex() {
  const docs = await getAllDocs();
  if (docs.length === 0) {
    return (
      <p className="font-mono text-sm text-[var(--color-muted)]">
        No docs yet.
      </p>
    );
  }
  redirect(`/docs/${docs[0].slug}`);
}

