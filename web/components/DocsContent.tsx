export function DocsContent({
  title,
  summary,
  html,
}: {
  title: string;
  summary?: string;
  html: string;
}) {
  return (
    <article className="docs-prose min-w-0">
      <header className="mb-10">
        <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-[var(--color-ink)]">
          {title}
        </h1>
        {summary && (
          <p className="mt-4 font-mono text-sm text-[var(--color-muted)] leading-relaxed">
            {summary}
          </p>
        )}
      </header>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
