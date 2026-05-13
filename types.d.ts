// Side-effect CSS imports (e.g. `import "./globals.css"` in app/layout.tsx)
// require an explicit module declaration under TypeScript 6's stricter
// resolution. Next.js handles this at the bundler level; this declaration
// just tells the type-checker to allow the import.
declare module "*.css";
