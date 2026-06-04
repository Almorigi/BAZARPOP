import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetail from "./ProductDetail";

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) return {};
  const price = (product.price / 100).toFixed(2);
  return {
    title: `${product.title} — La Soffitta del Collezionista`,
    description: product.description ?? `${product.title} in condizioni ${product.condition}. €${price}. Acquista su La Soffitta del Collezionista.`,
    openGraph: {
      title: product.title,
      description: product.description ?? `${product.title} — €${price}`,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  const price = (product.price / 100).toFixed(2);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? product.title,
    image: product.images,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: price,
      availability: product.sold || product.stock === 0
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "La Soffitta del Collezionista" },
      url: `https://www.lasoffittadelcollezionista.it/products/${product.id}`,
    },
    itemCondition: product.condition === "nuovo"
      ? "https://schema.org/NewCondition"
      : "https://schema.org/UsedCondition",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} />
    </>
  );
}
