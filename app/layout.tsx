import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import WhatsAppButton from "@/components/WhatsAppButton";
import BackToTop from "@/components/BackToTop";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// ID Google Analytics — sostituisci con il tuo ID reale (es. G-XXXXXXXXXX)
const GA_ID = "G-5GJCTH7YX2";

export const metadata: Metadata = {
  title: "La Soffitta del Collezionista — Fumetti, Libri, Videogiochi usati",
  description: "Acquista fumetti, manga, libri, videogiochi e oggetti da collezione usati. Selezionati con cura, spediti velocemente in tutta Italia. Prezzi onesti.",
  keywords: ["fumetti usati", "manga usati", "videogiochi usati", "libri usati", "collezione", "fumetti vintage", "retrogaming", "compra fumetti online"],
  openGraph: {
    title: "La Soffitta del Collezionista",
    description: "Fumetti, libri, videogiochi e oggetti da collezione. Selezionati con cura, spediti in tutta Italia.",
    url: "https://www.lasoffittadelcollezionista.it",
    siteName: "La Soffitta del Collezionista",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "https://www.lasoffittadelcollezionista.it/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "La Soffitta del Collezionista — Fumetti, Libri, Videogiochi usati",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Soffitta del Collezionista",
    description: "Fumetti, libri, videogiochi e oggetti da collezione usati.",
  },
  alternates: {
    canonical: "https://www.lasoffittadelcollezionista.it",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "MqaRDOx6jHjW3gNLTptWf1ywcl3UpKd0ITPjsboVE2k",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <CookieBanner />
        <WhatsAppButton />
        <BackToTop />
      </body>
    </html>
  );
}
