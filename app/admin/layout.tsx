import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import "./admin.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s · Painel Dancold" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0a1428" };

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased`} data-scroll-behavior="smooth">
      <body className="adm min-h-screen">{children}</body>
    </html>
  );
}
