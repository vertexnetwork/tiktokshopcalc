/**
 * Keystone config. Every brand string, palette token reference, feature flag,
 * and external link lives here. Hardcoded brand strings anywhere else in the
 * tree are a P0 audit violation per the Vertex Network scaffold spec.
 */
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "TikTok Shop Calc",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME || "TTShopCalc",
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "tiktokshopcalc.tools",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://tiktokshopcalc.tools",
  tagline: "See your true TikTok Shop margin before the fees eat it.",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Free 2026 TikTok Shop profit calculator — referral fee, creator commission, FBT, refund admin, sales tax. Browser math, no signup.",
  keywords: [
    "tiktok shop calculator",
    "tiktok shop fees",
    "tiktok shop profit calculator",
    "tiktok shop referral fee",
    "tiktok shop creator commission",
    "tiktok shop margin",
    "tiktok shop fbt",
    "tiktok shop seller fees 2026",
  ],
  supportEmail:
    process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL || "hello@tiktokshopcalc.tools",
  trademarkDisclaimer:
    "TikTok and TikTok Shop are trademarks of ByteDance Ltd. This is an independent tool, not affiliated with, endorsed by, or sponsored by TikTok or ByteDance.",

  theme: {
    colors: {
      bg: "var(--color-bg)",
      surface: "var(--color-surface)",
      accent: "var(--color-accent)",
      onBg: "var(--color-on-bg)",
      onAccent: "var(--color-on-accent)",
      muted: "var(--color-muted)",
      border: "var(--color-border)",
      success: "var(--color-success)",
      danger: "var(--color-danger)",
    },
    fontDisplay: "Poppins, system-ui, sans-serif",
    fontBody: "Inter, system-ui, sans-serif",
  },
  brand: {
    markColor: "#00E5FF",
    markBgColor: "#0A0A0F",
  },

  nav: {
    primary: [
      { label: "Calculator", href: "/" },
      { label: "Categories", href: "/tiktok-shop-fees" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ],
    footer: {
      product: [
        { label: "Calculator", href: "/" },
        { label: "Categories", href: "/tiktok-shop-fees" },
        { label: "Embed", href: "/embed" },
        { label: "Pricing", href: "/pricing" },
      ],
      company: [
        { label: "About", href: "/about" },
        { label: "Changelog", href: "/changelog" },
        { label: "Network", href: "/network" },
        { label: "Contact", href: "/contact" },
      ],
      legal: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
      ],
    },
  },

  jsonLd: {
    type: "FinanceApplication" as const,
    operatingSystem: "Any",
    applicationCategory: "FinanceApplication",
    price: "0",
  },

  github: {
    repoUrl: "https://github.com/vertexnetwork/tiktokshopcalc",
    // Flip to "1" after the public repo is live. Until then the audit-driven
    // "Open source" / "GitHub Issues" links stay hidden so we don't ship dead
    // anchors that destroy the trust we built everywhere else.
    public: process.env.NEXT_PUBLIC_GITHUB_PUBLIC === "1",
  },

  features: {
    embed: { enabled: process.env.NEXT_PUBLIC_EMBED_ENABLED === "1" },
    extension: { enabled: false },
    proEnabled: process.env.NEXT_PUBLIC_PRO_ENABLED === "1",
    email: false,
    ads: {
      provider: (process.env.NEXT_PUBLIC_AD_PROVIDER || "none") as
        | "none"
        | "adsense"
        | "mediavine"
        | "carbon",
    },
    affiliate: {
      enabled: process.env.NEXT_PUBLIC_AFFILIATE_ENABLED === "1",
      url: process.env.NEXT_PUBLIC_AFFILIATE_URL || "",
      label: process.env.NEXT_PUBLIC_AFFILIATE_LABEL || "",
      provider: process.env.NEXT_PUBLIC_AFFILIATE_PROVIDER || "",
    },
    consent: { required: true },
    themeToggle: false,
  },

  monetization: {
    stripe: {
      priceIds: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || "",
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || "",
      },
    },
    lemonSqueezy: { storeId: "", productSlug: "" },
    gumroad: {
      productUrl:
        process.env.NEXT_PUBLIC_GUMROAD_PRODUCT_URL ||
        "https://gumroad.com/l/tiktok-shop-margin-bible",
      price: process.env.NEXT_PUBLIC_GUMROAD_PRICE || "39",
      productName: "2026 TikTok Shop Margin Bible",
    },
  },

  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    bing: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "",
  },

  security: {
    contact: `mailto:${process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL || "hello@tiktokshopcalc.tools"}`,
    expires: "2027-05-12T00:00:00Z",
  },
} as const;

export type SiteConfig = typeof siteConfig;
