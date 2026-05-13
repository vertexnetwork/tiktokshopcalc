import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { Wordmark } from "@/components/brand/Wordmark";

export function SiteHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "color-mix(in oklab, var(--color-bg) 88%, transparent)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        className="container-page"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.75rem 1.25rem",
          minHeight: "var(--spacing-touch)",
        }}
      >
        <Link
          href="/"
          aria-label={`${siteConfig.name} home`}
          style={{ textDecoration: "none" }}
        >
          <Wordmark />
        </Link>

        {/* Desktop nav — visible at >=640px */}
        <nav
          aria-label="Primary"
          className="primary-nav"
          style={{ display: "none", gap: "1.5rem", alignItems: "center" }}
        >
          {siteConfig.nav.primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                color: "var(--color-on-bg)",
                textDecoration: "none",
                fontSize: "0.9375rem",
                fontWeight: 500,
              }}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={siteConfig.monetization.gumroad.productUrl + "?utm_source=tiktokshopcalc&utm_medium=header"}
            className="btn-primary"
            style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
          >
            Margin Bible — ${siteConfig.monetization.gumroad.price}
          </a>
        </nav>

        {/* Mobile menu — zero-JS <details> */}
        <details
          className="mobile-menu"
          style={{ display: "block", position: "relative" }}
        >
          <summary
            aria-label="Open menu"
            style={{
              listStyle: "none",
              cursor: "pointer",
              padding: "0.5rem",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "var(--spacing-touch)",
              height: "var(--spacing-touch)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
              <path
                d="M3 6h16M3 11h16M3 16h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </summary>
          <nav
            aria-label="Mobile menu"
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 0.5rem)",
              minWidth: 220,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 12,
              padding: "0.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              boxShadow: "var(--shadow-card)",
            }}
          >
            {siteConfig.nav.primary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "0.5rem 0.75rem",
                  color: "var(--color-on-bg)",
                  textDecoration: "none",
                  borderRadius: 8,
                  minHeight: "var(--spacing-touch)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={siteConfig.monetization.gumroad.productUrl + "?utm_source=tiktokshopcalc&utm_medium=mobile-header"}
              className="btn-primary"
              style={{ marginTop: "0.5rem", justifyContent: "center" }}
            >
              Margin Bible — ${siteConfig.monetization.gumroad.price}
            </a>
          </nav>
        </details>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .primary-nav { display: flex !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>
    </header>
  );
}
