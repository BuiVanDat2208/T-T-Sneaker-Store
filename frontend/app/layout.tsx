import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { QueryProvider } from "@/lib/query-provider";
import { AnalyticsProvider } from "@/providers/analytics-provider";
import { ChatWidgetWrapper as ChatWidget } from "@/components/chat/chat-widget-wrapper";
import "./globals.css";

const openSans = Open_Sans({ subsets: ["latin", "vietnamese"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

let safeMetadataBase: URL | undefined;
try {
  safeMetadataBase = new URL(siteUrl);
} catch (e) {
  // Fallback to undefined if siteUrl is invalid, Next.js will handle it
  safeMetadataBase = undefined;
}

export const metadata: Metadata = {
  metadataBase: safeMetadataBase,
  title: {
    default: "T&T Sneaker Store - Giày thể thao chính hãng",
    template: "%s | T&T Sneaker Store"
  },
  description: "Website bán giày thể thao chính hãng, tối ưu trải nghiệm mua sắm và tư vấn size nhanh.",
  openGraph: {
    title: "T&T Sneaker Store",
    description: "Giày thể thao chính hãng Nike, Adidas, New Balance, Puma.",
    url: siteUrl,
    siteName: "T&T Sneaker Store",
    locale: "vi_VN",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "T&T Sneaker Store",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+84900000000",
      contactType: "customer service",
      areaServed: "VN",
      availableLanguage: ["Vietnamese"]
    }
  };

  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={openSans.className} suppressHydrationWarning>
        <QueryProvider>
          <AnalyticsProvider>
            {children}
            <ChatWidget />
          </AnalyticsProvider>
        </QueryProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </body>
    </html>
  );
}
