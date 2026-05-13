import { siteConfig } from "@/lib/site-config";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-static";

export function GET(): Response {
  const body = `# ${siteConfig.name}

> ${siteConfig.tagline}

${siteConfig.description}

URL: ${siteConfig.url}
Contact: ${siteConfig.supportEmail}

## What this site does

A free, browser-side TikTok Shop profit calculator. No signup, no API, no tracking
beyond opt-in analytics. Math is sourced from TikTok Seller University and the
2026 fee schedule. Open source at ${siteConfig.github.repoUrl}.

## Trademarks

${siteConfig.trademarkDisclaimer}

## Key pages

- Calculator: ${siteConfig.url}/
- Categories index: ${siteConfig.url}/tiktok-shop-fees
- About: ${siteConfig.url}/about
- Pricing (Margin Bible PDF): ${siteConfig.url}/pricing
- Changelog: ${siteConfig.url}/changelog
- Vertex Network: ${siteConfig.url}/network

## Category pages (${CATEGORIES.length})

${CATEGORIES.map((c) => `- [${c.title}](${siteConfig.url}/tiktok-shop-fees/${c.slug}) — ${(c.rate * 100).toFixed(0)}% referral rate, ${(c.creatorBand[0] * 100).toFixed(0)}–${(c.creatorBand[1] * 100).toFixed(0)}% creator commission band.`).join("\n")}
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=10800, s-maxage=10800",
    },
  });
}
