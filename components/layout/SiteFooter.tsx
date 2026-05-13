"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { safeTrack } from "@/lib/analytics";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        borderTop: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        padding: "3rem 0 2rem",
        marginTop: "4rem",
      }}
    >
      <div
        className="container-page"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "2rem",
          padding: "0 1.25rem",
        }}
      >
        <div>
          <p style={{ fontWeight: 700, color: "var(--color-on-bg)", margin: 0 }}>
            {siteConfig.name}
          </p>
          <p
            className="text-muted"
            style={{ fontSize: "0.875rem", marginTop: "0.5rem", maxWidth: 240, lineHeight: 1.5 }}
          >
            {siteConfig.tagline}
          </p>
        </div>
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Product
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {siteConfig.nav.footer.product.map((l) => (
              <li key={l.href}>
                <Link href={l.href} style={{ color: "var(--color-on-bg)", fontSize: "0.875rem", textDecoration: "none" }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Company
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {siteConfig.nav.footer.company.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  style={{ color: "var(--color-on-bg)", fontSize: "0.875rem", textDecoration: "none" }}
                  onClick={l.href === "/network" ? () => safeTrack("vertex_footer_opened") : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
            Legal
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {siteConfig.nav.footer.legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} style={{ color: "var(--color-on-bg)", fontSize: "0.875rem", textDecoration: "none" }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="container-page"
        style={{
          padding: "2rem 1.25rem 0",
          marginTop: "2rem",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <p className="text-muted" style={{ fontSize: "0.75rem", margin: 0, maxWidth: 720 }}>
          © {year} {siteConfig.name} · Independent tool, not affiliated with TikTok or ByteDance ·{" "}
          <Link href="/network" onClick={() => safeTrack("vertex_footer_opened")}>
            Part of the Vertex Network
          </Link>
        </p>
        {siteConfig.github.public && (
          <p className="text-muted" style={{ fontSize: "0.75rem", margin: 0 }}>
            <a href={siteConfig.github.repoUrl} target="_blank" rel="noopener noreferrer">
              Open source
            </a>
          </p>
        )}
      </div>
    </footer>
  );
}
