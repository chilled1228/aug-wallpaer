import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SEOService } from "@/lib/seo";
import { config } from "@/lib/config";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = SEOService.generateMetadata({
  title: config.seo.defaultTitle,
  description: config.seo.defaultDescription,
  keywords: config.seo.keywords,
  url: '/',
  type: 'website'
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = SEOService.generateWebsiteStructuredData();
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": config.app.name,
    "description": config.app.description,
    "url": config.app.url,
    "logo": `${config.app.url}/logo.png`,
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-WALLPAPER",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "US"
    },
    "sameAs": [
      "https://facebook.com/wallpapergallery",
      "https://instagram.com/wallpapergallery",
      "https://pinterest.com/wallpapergallery"
    ]
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <link rel="canonical" href={config.app.url} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-brand-surface`}
      >
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
