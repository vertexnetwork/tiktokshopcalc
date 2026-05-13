import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="container-page" style={{ padding: "6rem 1.25rem", textAlign: "center" }}>
        <span className="pill">404</span>
        <h1 style={{ marginTop: "1.5rem" }}>That route doesn&apos;t exist.</h1>
        <p className="text-muted" style={{ margin: "1rem auto", maxWidth: 480 }}>
          The page you&apos;re looking for isn&apos;t here. Head back to the calculator or browse
          our category index.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "2rem" }}>
          <Link href="/" className="btn-primary">
            Open calculator
          </Link>
          <Link href="/tiktok-shop-fees" className="btn-ghost">
            Browse categories
          </Link>
        </div>
        <p className="text-muted" style={{ marginTop: "3rem", fontSize: "0.875rem" }}>
          Visit <Link href={siteConfig.url}>{siteConfig.domain}</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
