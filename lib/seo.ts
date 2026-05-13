/**
 * JSON-LD builders. Each function returns a plain object that gets serialized
 * inside a <script type="application/ld+json"> tag by the JsonLd component.
 */

import { siteConfig } from "./site-config";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.supportEmail,
  };
}

export function financeApplicationJsonLd(opts?: { name?: string; description?: string }) {
  return {
    "@context": "https://schema.org",
    "@type": siteConfig.jsonLd.type,
    name: opts?.name ?? siteConfig.name,
    description: opts?.description ?? siteConfig.description,
    url: siteConfig.url,
    operatingSystem: siteConfig.jsonLd.operatingSystem,
    applicationCategory: siteConfig.jsonLd.applicationCategory,
    offers: {
      "@type": "Offer",
      price: siteConfig.jsonLd.price,
      priceCurrency: "USD",
    },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function howToJsonLd(opts: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: opts.name,
    description: opts.description,
    step: opts.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function aboutPageJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About ${siteConfig.name}`,
    url: `${siteConfig.url}/about`,
    description: siteConfig.description,
  };
}

export function networkCollectionJsonLd(sites: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteConfig.name} — Vertex Network`,
    url: `${siteConfig.url}/network`,
    hasPart: sites.map((s) => ({ "@type": "WebSite", name: s.name, url: s.url })),
  };
}
