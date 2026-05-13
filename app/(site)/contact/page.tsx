import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Contact — ${siteConfig.name}`,
  description: `Get in touch with ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Contact</h1>
      <p className="text-muted">
        Spotted a bug in the fee math? Have a category we should add? Drop us a line.
      </p>
      <div className="card" style={{ padding: "1.5rem", marginTop: "1.5rem" }}>
        <p style={{ margin: 0, color: "var(--color-muted)" }}>Email</p>
        <p style={{ margin: "0.25rem 0 0", fontSize: "1.125rem" }}>
          <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
        </p>
      </div>
      <div className="card" style={{ padding: "1.5rem", marginTop: "1rem" }}>
        <p style={{ margin: 0, color: "var(--color-muted)" }}>GitHub Issues</p>
        <p style={{ margin: "0.25rem 0 0", fontSize: "1.125rem" }}>
          <a href={`${siteConfig.github.repoUrl}/issues`}>{siteConfig.github.repoUrl}/issues</a>
        </p>
      </div>
    </div>
  );
}
