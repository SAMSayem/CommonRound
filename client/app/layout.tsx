import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/toast-provider";
import { SiteFrame } from "@/components/site-frame";

export const metadata: Metadata = {
  title: "CommonGround — Local action. Shared impact.",
  description: "Find community service events, meet your neighbours, and turn good intentions into local action.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <SiteFrame>{children}</SiteFrame>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
