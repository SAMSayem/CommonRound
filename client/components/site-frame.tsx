import type { ReactNode } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export function SiteFrame({ children }: { children: ReactNode }) {
  return <><Navbar /><div className="site-content">{children}</div><Footer /></>;
}
