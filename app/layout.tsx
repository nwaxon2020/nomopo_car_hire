// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Nav from "@/ui/nax";
import Footer from "@/ui/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Default metadata for pages that don't specify their own
export const metadata: Metadata = {
  title: {
    default: "NOMO CARS - Reliable Car Hire & Driver Services",
    template: "%s | NOMO CARS"
  },
  description: "Book safe, verified vehicles with professional drivers. Register as a verified driver and join Nigeria's most trusted transportation platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />

        {/* Basic SEO */}
        <meta name="author" content="Nomo Car Hire" />
        <meta name="description" content="Book affordable and reliable car hire services with Nomo Car Hire." />
        <meta name="keywords" content="car hire, rentals, nomo, driving, transportation, vehicle booking" />

        {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
        <meta property="og:title" content="Nomo Car Hire" />
        <meta
          property="og:description"
          content="Book affordable and reliable car hire services in Nigeria with Nomo Car Hire."
        />
        <meta property="og:image" content="/driver2.jpeg" />
        <meta property="og:url" content="https://your-domain.com" />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nomo Car Hire" />
        <meta
          name="twitter:description"
          content="Book affordable and reliable car hire services in Nigeria with Nomo Car Hire."
        />
        <meta name="twitter:image" content="/driver2.jpeg" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Nav/>
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}