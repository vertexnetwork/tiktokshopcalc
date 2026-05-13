import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

export function GET(): Response {
  const body = `Contact: ${siteConfig.security.contact}
Expires: ${siteConfig.security.expires}
Preferred-Languages: en
Canonical: ${siteConfig.url}/.well-known/security.txt
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
