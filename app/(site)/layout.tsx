import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container-page" style={{ padding: "3rem 1.25rem 4rem", minHeight: "60vh" }}>
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
