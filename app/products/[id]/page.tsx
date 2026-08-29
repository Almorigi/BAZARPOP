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
    alternates: {
      canonical: `https://www.lasoffittadelcollezionista.it/products/${id}`,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  // Prodotti correlati: stessa categoria, escludi prodotto corrente, max 4
  const [{ data: related }, { data: settingsRows }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("category", product.category)
      .eq("sold", false)
      .neq("id", id)
      .limit(4),
    supabase.from("settings").select("*"),
  ]);

  const settingsMap: Record<string, string> = {};
  for (const row of settingsRows ?? []) settingsMap[row.key] = row.value;
  const shippingCents = parseInt(settingsMap.shipping_standard ?? "590");
  const freeThresholdCents = parseInt(settingsMap.shipping_free_threshold ?? "4000");
  const shippingValue = freeThresholdCents > 0 && product.price >= freeThresholdCents
    ? "0.00"
    : (shippingCents / 100).toFixed(2);

  const price = (product.price / 100).toFixed(2);
  const productUrl = `https://www.lasoffittadelcollezionista.it/products/${product.id}`;
  const availability = product.sold || product.stock === 0
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";
  const itemCondition = product.condition === "nuovo"
    ? "https://schema.org/NewCondition"
    : "https://schema.org/UsedCondition";

  const categoryMap: Record<string, string> = {
    fumetti: "Media > Books > Comics & Graphic Novels",
    libri:   "Media > Books",
    videogiochi: "Electronics > Video Games",
    dvd:     "Media > DVDs & Videos",
    oggetti: "Arts & Entertainment > Collectibles",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? `${product.title} in condizioni ${product.condition}. Acquista su La Soffitta del Collezionista.`,
    image: product.images.length > 0 ? product.images : undefined,
    sku: product.id,
    url: productUrl,
    category: categoryMap[product.category] ?? "Collectibles",
    brand: {
      "@type": "Brand",
      name: "La Soffitta del Collezionista",
    },
    itemCondition,
    ...(product.avg_rating && product.review_count && product.review_count > 0 ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.avg_rating.toFixed(1),
        reviewCount: product.review_count,
        bestRating: "5",
        worstRating: "1",
      },
    } : {}),
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability,
      itemCondition,
      seller: {
        "@type": "Organization",
        name: "La Soffitta del Collezionista",
        url: "https://www.lasoffittadelcollezionista.it",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: shippingValue,
          currency: "EUR",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IT",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          businessDays: {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
          },
          cutoffTime: "12:00:00+01:00",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime:  { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IT",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: "https://www.lasoffittadelcollezionista.it" },
      { "@type": "ListItem", position: 2, name: "Collezione", item: "https://www.lasoffittadelcollezionista.it/products" },
      { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <ProductDetail product={product} related={related ?? []} />
    </>
  );
}
