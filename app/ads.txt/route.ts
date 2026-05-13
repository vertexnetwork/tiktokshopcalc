export const dynamic = "force-static";

export function GET(): Response {
  // Placeholder per IAB ads.txt spec. Fill in publisher IDs once AdSense / Mediavine
  // approve, then sync via the hub or commit per-site.
  const body = `# ads.txt — TikTok Shop Calc
# AdSense approval pending. Fill with publisher IDs at launch.
# Format: <SSP domain>, <publisher account ID>, <DIRECT|RESELLER>, <certification authority ID>
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
