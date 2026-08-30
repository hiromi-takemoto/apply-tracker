import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./site-header";

export const metadata: Metadata = {
  title: "ApplyTracker",
  description: "クラウドソーシング案件の応募管理",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja">
      <body><SiteHeader />{children}</body>
    </html>
  );
}
