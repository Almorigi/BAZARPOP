import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = "https://www.lasoffittadelcollezionista.it";

  const { data: products } = await supabase
    .from("products")
    .select("id, created_at")
    .eq("sold", false);

  const productUrls = (products ?? []).map((p) => ({
    url: `${siteUrl}/products/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/products?category=fumetti`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/products?category=libri`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/products?category=videogiochi`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/products?category=oggetti`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...productUrls,
  ];
}
