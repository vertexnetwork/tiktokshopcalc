import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { buildCSP } from "./lib/csp";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [["remark-gfm"]],
    rehypePlugins: [["rehype-slug"], ["rehype-autolink-headings"]],
  },
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  experimental: {
    mdxRs: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    const csp = buildCSP({
      vercelAnalytics: true,
      adsense: process.env.NEXT_PUBLIC_AD_PROVIDER === "adsense",
      mediavine: process.env.NEXT_PUBLIC_AD_PROVIDER === "mediavine",
      carbon: process.env.NEXT_PUBLIC_AD_PROVIDER === "carbon",
      clarity: !!process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
      plausible: !!process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
    });
    return [
      {
        source: "/((?!embed).*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/embed/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp.replace("frame-ancestors 'self'", "frame-ancestors *") },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default withMDX(nextConfig);
