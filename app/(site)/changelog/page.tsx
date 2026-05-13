import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import changelog from "@/content/changelog.json";

export const metadata: Metadata = {
  title: `Changelog — ${siteConfig.name}`,
  description: `What changed in ${siteConfig.name} over time.`,
  alternates: { canonical: `${siteConfig.url}/changelog` },
};

interface ChangelogEntry {
  date: string;
  title: string;
}

export default function ChangelogPage() {
  const entries = (changelog as ChangelogEntry[]) || [];
  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Changelog</h1>
      <p className="text-muted">Dates and headlines only. Full commit history lives in GitHub.</p>
      <ul style={{ listStyle: "none", padding: 0, marginTop: "2rem" }}>
        {entries.length === 0 ? (
          <li className="text-muted">No entries yet — check back after the first deploy.</li>
        ) : (
          entries.map((e) => (
            <li
              key={`${e.date}-${e.title}`}
              style={{
                display: "flex",
                gap: "1rem",
                padding: "0.75rem 0",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <time
                dateTime={e.date}
                style={{ color: "var(--color-muted)", minWidth: 110, fontVariantNumeric: "tabular-nums" }}
              >
                {e.date}
              </time>
              <span>{e.title}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
