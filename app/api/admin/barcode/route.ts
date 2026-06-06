import { NextRequest, NextResponse } from "next/server";

export interface BarcodeResult {
  title: string;
  description: string;
  category: string;
  imageUrl?: string;
  author?: string;
  year?: string;
  publisher?: string;
  found: boolean;
}

// Cerca su Open Library (ottimo per libri con ISBN)
async function lookupOpenLibrary(code: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${code}&format=json&jscmd=data`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    const key = `ISBN:${code}`;
    if (!data[key]) return null;

    const book = data[key];
    const title = book.title ?? "";
    const authors = book.authors?.map((a: { name: string }) => a.name).join(", ") ?? "";
    const year = book.publish_date ?? "";
    const publisher = book.publishers?.[0]?.name ?? "";
    const subjects = book.subjects?.map((s: { name?: string } | string) =>
      typeof s === "string" ? s : s.name
    ).join(", ") ?? "";

    const description = [
      authors ? `Autore: ${authors}` : "",
      publisher ? `Editore: ${publisher}` : "",
      year ? `Anno: ${year}` : "",
      subjects ? `Soggetti: ${subjects}` : "",
    ].filter(Boolean).join(" | ");

    const coverUrl = book.cover?.medium ?? book.cover?.large ?? "";

    return {
      title,
      description,
      category: "libri",
      imageUrl: coverUrl,
      author: authors,
      year,
      publisher,
      found: true,
    };
  } catch {
    return null;
  }
}

// Cerca su Open Food Facts / UPC Item DB (per prodotti generici)
async function lookupUPC(code: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;

    const title = item.title ?? "";
    const description = item.description ?? "";
    const brand = item.brand ?? "";
    const category = item.category ?? "";
    const imageUrl = item.images?.[0] ?? "";

    // Indovina la categoria del sito
    const catLower = (category + " " + title).toLowerCase();
    let siteCat = "oggetti";
    if (catLower.includes("book") || catLower.includes("libr")) siteCat = "libri";
    else if (catLower.includes("game") || catLower.includes("gioc") || catLower.includes("video")) siteCat = "videogiochi";
    else if (catLower.includes("dvd") || catLower.includes("blu") || catLower.includes("film") || catLower.includes("movie")) siteCat = "dvd";
    else if (catLower.includes("comic") || catLower.includes("manga") || catLower.includes("fumet")) siteCat = "fumetti";

    return {
      title,
      description: [description, brand ? `Marca: ${brand}` : ""].filter(Boolean).join(" | "),
      category: siteCat,
      imageUrl,
      found: true,
    };
  } catch {
    return null;
  }
}

// Cerca su Google Books come fallback (ottimo per libri)
async function lookupGoogleBooks(code: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${code}`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    const item = data.items?.[0]?.volumeInfo;
    if (!item) return null;

    const title = item.title ?? "";
    const authors = item.authors?.join(", ") ?? "";
    const publisher = item.publisher ?? "";
    const year = item.publishedDate?.substring(0, 4) ?? "";
    const description = item.description?.substring(0, 300) ?? "";
    const imageUrl = item.imageLinks?.thumbnail ?? item.imageLinks?.smallThumbnail ?? "";

    return {
      title,
      description: description || [
        authors ? `Autore: ${authors}` : "",
        publisher ? `Editore: ${publisher}` : "",
        year ? `Anno: ${year}` : "",
      ].filter(Boolean).join(" | "),
      category: "libri",
      imageUrl,
      author: authors,
      year,
      publisher,
      found: true,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "Codice mancante" }, { status: 400 });

  // Prova prima Open Library (per ISBN libri)
  const isISBN = code.length === 10 || code.length === 13;

  if (isISBN) {
    const olResult = await lookupOpenLibrary(code);
    if (olResult) return NextResponse.json(olResult);

    const gbResult = await lookupGoogleBooks(code);
    if (gbResult) return NextResponse.json(gbResult);
  }

  // Prova UPC (per prodotti generici, DVD, giochi)
  const upcResult = await lookupUPC(code);
  if (upcResult) return NextResponse.json(upcResult);

  // Nessun risultato trovato
  return NextResponse.json({ found: false, title: "", description: "", category: "oggetti" });
}
