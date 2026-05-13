# tiktokshopcalc

Free 2026 TikTok Shop profit calculator. Browser math, no signup.

Part of the [Vertex Network](https://github.com/vertexnetwork/hub).

## Stack

Next.js 15 · React 19 · Tailwind v4 · TypeScript · Vercel

## Dev

```bash
pnpm install
pnpm test            # fee engine + share codec
pnpm dev             # http://localhost:3000
pnpm build
```

## Files of note

- `lib/fee-engine.ts` — the core pure-math module. Every formula is sourced from TikTok Seller University and reconciled across four independent calculators. Fully unit-tested.
- `lib/categories.ts` — 60-entry category catalog driving the pSEO routes at `/tiktok-shop-fees/[slug]`.
- `lib/site-config.ts` — every brand string and feature flag.
- `app/(pseo)/tiktok-shop-fees/[slug]/page.tsx` — pSEO route, generates 60+ static pages.
- `app/page.tsx` — the calculator.

See [`PLAN.md`](./PLAN.md) for the full implementation plan and rationale.

## License

MIT. TikTok and TikTok Shop are trademarks of ByteDance Ltd. This is an independent tool, not affiliated with, endorsed by, or sponsored by TikTok or ByteDance.
