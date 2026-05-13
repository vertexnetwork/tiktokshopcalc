import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/seo/JsonLd";
import { websiteJsonLd, organizationJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  alternates: { canonical: siteConfig.url },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  verification: {
    google: siteConfig.verification.google || undefined,
    other: siteConfig.verification.bing
      ? { "msvalidate.01": siteConfig.verification.bing }
      : undefined,
  },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  icons: {
    // /apple-icon.png is generated dynamically by app/apple-icon.tsx (next/og)
    // so we don't reference a static file that doesn't exist on disk.
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0F",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <JsonLd data={websiteJsonLd()} />
        <JsonLd data={organizationJsonLd()} />
        {children}
        {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "1" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
