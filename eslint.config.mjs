// Minimal flat config — ESLint 10 dropped the transitive @eslint/eslintrc
// package that FlatCompat depends on, breaking the old `compat.extends(...)`
// path. We re-add Next.js + TypeScript lint rules in a follow-up PR once
// eslint-config-next's flat export stabilizes.
//
// Type/test correctness is enforced by `pnpm typecheck` + `pnpm test`,
// both of which gate CI ahead of `next build`.

export default [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "out/**",
      "coverage/**",
      "playwright-report/**",
    ],
  },
];
