import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `How ${siteConfig.name} handles data, analytics, and your privacy.`,
  alternates: { canonical: `${siteConfig.url}/privacy` },
};

const LAST_UPDATED = "May 12, 2026";

export default function PrivacyPage() {
  const adsEnabled = siteConfig.features.ads.provider !== "none";
  const emailEnabled = siteConfig.features.email;
  const proEnabled = siteConfig.features.proEnabled;
  const affiliateEnabled = siteConfig.features.affiliate.enabled;

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Privacy Policy</h1>
      <p className="text-muted">Last updated: {LAST_UPDATED}</p>

      <h2>What we collect</h2>
      <p>
        {siteConfig.name} is a free, browser-side calculator. We do not require an account. The
        calculator runs entirely in your browser — your inputs never leave your device unless you
        explicitly share a link.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Vercel Analytics to count page views and measure performance. These are aggregated,
        cookieless, and do not identify you personally. You can opt out of all analytics in the
        cookie banner.
      </p>

      {siteConfig.features.consent.required && (
        <>
          <h2>Optional services</h2>
          <p>
            If you accept the cookie banner, we may additionally load Microsoft Clarity to
            understand UX friction. Clarity records anonymized session replays. We never sell or
            share this data.
          </p>
        </>
      )}

      {adsEnabled && (
        <>
          <h2>Advertising</h2>
          <p>
            We display ads via {siteConfig.features.ads.provider}. Our ad partner may use cookies
            to measure ad performance, per their own privacy policy.
          </p>
        </>
      )}

      <h2>What we don&apos;t do</h2>
      <ul>
        <li>We do not sell your data.</li>
        <li>We do not run cross-site tracking pixels.</li>
        <li>We do not build advertising profiles about you.</li>
        <li>We do not log your calculator inputs server-side.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use a small number of first-party cookies (theme preference, cookie-consent state). No
        third-party cookies load until you accept the banner.
      </p>

      {affiliateEnabled && (
        <>
          <h2>Affiliate links</h2>
          <p>
            Some outbound links are affiliate links — clearly disclosed in the footer. We may earn
            a commission when you click through and purchase. This never changes your price.
          </p>
        </>
      )}

      {(emailEnabled || proEnabled) && (
        <>
          <h2>Email and paid services</h2>
          <p>
            If you provide your email or purchase a paid product, we store the minimum data needed
            to deliver the product. We do not market beyond the original purpose.
          </p>
        </>
      )}

      <h2>Your rights</h2>
      <p>
        Email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> and we
        will respond within 30 days.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We&apos;ll update the &quot;Last updated&quot; date when we change this policy. Material
        changes will be announced on <a href="/changelog">the changelog</a>.
      </p>

      <p className="text-muted" style={{ marginTop: "3rem" }}>
        {siteConfig.trademarkDisclaimer}
      </p>
    </div>
  );
}
