import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { EmbedSnippet } from "@/components/embed/EmbedSnippet";

export const metadata: Metadata = {
  title: `Embed — ${siteConfig.name}`,
  description: `Drop the ${siteConfig.name} calculator into your blog, course, or product page with one iframe.`,
  alternates: { canonical: `${siteConfig.url}/embed` },
};

export default function EmbedPage() {
  return (
    <div style={{ maxWidth: 880 }}>
      <h1>Embed the calculator on your site</h1>
      <p className="text-muted" style={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
        Free, no API key, no rate limits. Copy the iframe below and paste it anywhere — Shopify
        blog, Webflow, WordPress, plain HTML.
      </p>

      <EmbedSnippet />

      <h2 style={{ marginTop: "3rem" }}>Live preview</h2>
      <p className="text-muted">This is the embed exactly as it appears on your site:</p>
      <div
        className="card"
        style={{
          marginTop: "1rem",
          padding: "0.5rem",
          aspectRatio: "16 / 12",
          minHeight: 480,
        }}
      >
        <iframe
          src="/embed-iframe"
          title={`${siteConfig.name} embedded calculator`}
          style={{ width: "100%", height: "100%", border: 0, borderRadius: 8 }}
        />
      </div>

      <h2 style={{ marginTop: "3rem" }}>Terms of embedding</h2>
      <ul>
        <li>Free for any non-commercial site, blog, or course.</li>
        <li>Keep the &quot;Powered by {siteConfig.name}&quot; attribution visible.</li>
        <li>
          Don&apos;t modify the iframe content to misrepresent the source of the math.
          {siteConfig.github.public && (
            <>
              {" "}
              The source is open at{" "}
              <a href={siteConfig.github.repoUrl}>{siteConfig.github.repoUrl}</a>.
            </>
          )}
        </li>
      </ul>
    </div>
  );
}
