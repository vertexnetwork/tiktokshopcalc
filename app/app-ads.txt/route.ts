export const dynamic = "force-static";

export function GET(): Response {
  const body = `# app-ads.txt — TikTok Shop Calc
# Not applicable for a web-only property. File present per IAB spec compliance.
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
