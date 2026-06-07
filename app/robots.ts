import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/coming-soon", "/cart", "/checkout"],
      },
    ],
    sitemap: "https://www.lasoffittadelcollezionista.it/sitemap.xml",
  };
}
