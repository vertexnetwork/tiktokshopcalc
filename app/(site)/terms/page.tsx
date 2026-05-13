import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Terms of Use — ${siteConfig.name}`,
  description: `Terms governing your use of ${siteConfig.name}.`,
  alternates: { canonical: `${siteConfig.url}/terms` },
};

const LAST_UPDATED = "May 12, 2026";

export default function TermsPage() {
  const affiliateEnabled = siteConfig.features.affiliate.enabled;
  const proEnabled = siteConfig.features.proEnabled;

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Terms of Use</h1>
      <p className="text-muted">Last updated: {LAST_UPDATED}</p>

      <h2>What this site is</h2>
      <p>
        {siteConfig.name} is a free, browser-side calculator that estimates TikTok Shop seller
        margins based on publicly documented 2026 fee structures. It is informational only.
      </p>

      <h2>What this site isn&apos;t</h2>
      <p>
        This is not financial advice, accounting advice, or tax advice. TikTok Shop&apos;s fees
        change frequently and may apply to your specific account differently. Verify against your
        own settlement reports before making business decisions.
      </p>

      <h2>Trademarks</h2>
      <p>{siteConfig.trademarkDisclaimer}</p>

      <h2>Acceptable use</h2>
      <p>
        Use {siteConfig.name} for any lawful purpose. Do not scrape the site at rates that disrupt
        service. Do not embed the calculator in a way that misrepresents its source.
      </p>

      {affiliateEnabled && (
        <>
          <h2>Affiliate links</h2>
          <p>
            Some outbound links on {siteConfig.name} are affiliate links. We may earn a commission
            when you purchase via those links. Affiliate status never changes the price you pay.
          </p>
        </>
      )}

      {proEnabled && (
        <>
          <h2>Paid plans</h2>
          <p>
            Paid products are sold via third-party processors. Refunds follow each processor&apos;s
            own policy. We process refunds in good faith for unused products within 14 days of
            purchase.
          </p>
        </>
      )}

      <h2>Disclaimer of warranties</h2>
      <p>
        {siteConfig.name} is provided &quot;as is&quot; without warranty of any kind. We make
        every effort to keep the fee schedule accurate but cannot guarantee outcomes.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, {siteConfig.name} and its operators are not liable for
        business losses, lost profits, or consequential damages resulting from use of this
        calculator.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We&apos;ll update the &quot;Last updated&quot; date when we change these terms. Continued
        use after a change constitutes acceptance.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>
    </div>
  );
}
