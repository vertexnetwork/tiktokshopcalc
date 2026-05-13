/**
 * pSEO MDX frontmatter contract. The generator script (scripts/generate-pseo.ts)
 * produces files that conform to this shape.
 */

export interface PseoFrontmatter {
  slug: string;
  title: string;
  description: string;
  category: string;
  related: string[];
  publishedAt: string;
}
