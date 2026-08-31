import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import StorefrontShell from "@/components/layout/StorefrontShell";
import { db } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await db.getSettings();
  return {
    metadataBase: new URL("https://hazenshop.com"),
    title: {
      template: "%s | HAZENSHOP (hazenshop.com)",
      default: settings.seoTitle || "HAZENSHOP (hazenshop.com) — Luxury Bedsheets & Window Curtains in Bangladesh",
    },
    description:
      settings.seoDescription ||
      "Order 100% Egyptian Cotton Bed Sheets, Quilts & Comforter Sets with Cash on Delivery across Bangladesh.",
    keywords: settings.seoKeywords,
    openGraph: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: ["/logo.jpg"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await db.getSettings();
  const categories = await db.getCategories();

  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen bg-slate-900 selection:bg-brand-500 selection:text-brand-dark">
        <CartProvider>
          <ToastProvider>
            <StorefrontShell settings={settings} categories={categories}>
              {children}
            </StorefrontShell>
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}
