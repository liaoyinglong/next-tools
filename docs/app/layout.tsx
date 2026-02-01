import { RootProvider } from "fumadocs-ui/provider/next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./global.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s - Dune Tools Documentation",
    default: "Dune Tools Documentation",
  },
  description: "Dune Tools Documentation",
  applicationName: "Dune Tools",
  generator: "Next.js",
  appleWebApp: {
    title: "Dune Tools",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
