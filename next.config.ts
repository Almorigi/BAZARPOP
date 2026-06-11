import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Le immagini vengono già ridimensionate al caricamento (1200px WebP):
    // l'ottimizzatore Vercel non serve e ha un limite di 5000 trasformazioni/mese
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "comicvine.gamespot.com" },
      { protocol: "https", hostname: "*.gamespot.com" },
    ],
  },
};

export default nextConfig;
