import { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase";
import { posts } from "./blog/posts";

const BASE_URL = "https://www.lasoffittadelcollezionista.it";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                       lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/products`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/chi-siamo`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contatti`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/offerte`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE_URL}/recensioni`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.6 },
    { url: `${BASE_URL}/privacy`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
    { url: `${BASE_URL}/termini`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.2 },
  ];

  // Pagine categoria
  const categoryPages: MetadataRoute.Sitemap = ["fumetti","libri","videogiochi","dvd","oggetti"].map(cat => ({
    url: `${BASE_URL}/products?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    ...posts.map(p => ({
      url: `${BASE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  const [{ data: products }, { data: bundles }] = await Promise.all([
    supabase.from("products").select("id, created_at").eq("sold", false),
    supabase.from("bundles").select("id, created_at"),
  ]);

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${BASE_URL}/products/${p.id}`,
    lastModified: new Date(p.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const bundlePages: MetadataRoute.Sitemap = (bundles ?? []).map((b) => ({
    url: `${BASE_URL}/bundle/${b.id}`,
    lastModified: new Date(b.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...categoryPages, ...blogPages, ...productPages, ...bundlePages];
}
