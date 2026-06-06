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
  multiple?: BarcodeResult[]; // per ricerca per titolo
}

// Editori Bonelli e fumetti italiani noti
const BONELLI_PUBLISHERS = ["bonelli", "sergio bonelli", "star comics", "panini", "rw lion", "bao", "tunué", "magic press"];
const BONELLI_SERIES = ["dylan dog", "tex", "zagor", "diabolik", "martin mystère", "julia", "nick raider", "mister no", "corto maltese", "magico vento", "dampyr", "brendon", "adam wild"];

function guessCategory(title: string, publisher: string, subjects: string): string {
  const all = (title + " " + publisher + " " + subjects).toLowerCase();
  if (all.includes("dvd") || all.includes("blu-ray") || all.includes("film") || all.includes("movie")) return "dvd";
  if (all.includes("game") || all.includes("gioco") || all.includes("videogioc") || all.includes("playstation") || all.includes("nintendo") || all.includes("xbox")) return "videogiochi";
  if (
    BONELLI_PUBLISHERS.some(p => all.includes(p)) ||
    BONELLI_SERIES.some(s => all.includes(s)) ||
    all.includes("comic") || all.includes("manga") || all.includes("fumett") ||
    all.includes("graphic novel") || all.includes("albo")
  ) return "fumetti";
  return "libri";
}

// Google Books — funziona per ISBN e per ricerca per titolo (senza API key)
async function searchGoogleBooks(query: string, isISBN = false): Promise<BarcodeResult[]> {
  try {
    const q = isISBN ? `isbn:${query}` : `intitle:${encodeURIComponent(query)}`;
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=8&langRestrict=it`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (!data.items?.length) return [];

    return data.items.map((item: Record<string, unknown>) => {
      const v = item.volumeInfo as Record<string, unknown>;
      const title = (v.title as string) ?? "";
      const authors = ((v.authors as string[]) ?? []).join(", ");
      const publisher = (v.publisher as string) ?? "";
      const year = ((v.publishedDate as string) ?? "").substring(0, 4);
      const description = ((v.description as string) ?? "").substring(0, 400);
      const imageUrl = ((v.imageLinks as Record<string, string>) ?? {}).thumbnail ??
                       ((v.imageLinks as Record<string, string>) ?? {}).smallThumbnail ?? "";
      const subjects = ((v.categories as string[]) ?? []).join(" ");

      const category = guessCategory(title, publisher, subjects);

      return {
        title,
        description: description || [
          authors   ? `Autore: ${authors}`     : "",
          publisher ? `Editore: ${publisher}`  : "",
          year      ? `Anno: ${year}`           : "",
        ].filter(Boolean).join(" | "),
        category,
        imageUrl: imageUrl.replace("http://", "https://"),
        author: authors,
        year,
        publisher,
        found: true,
      } as BarcodeResult;
    });
  } catch {
    return [];
  }
}

// Open Library — ISBN lookup
async function lookupOpenLibrary(isbn: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    const book = data[`ISBN:${isbn}`];
    if (!book) return null;

    const title = book.title ?? "";
    const authors = book.authors?.map((a: { name: string }) => a.name).join(", ") ?? "";
    const year = book.publish_date ?? "";
    const publisher = book.publishers?.[0]?.name ?? "";
    const subjects = book.subjects?.map((s: { name?: string } | string) =>
      typeof s === "string" ? s : s.name).join(" ") ?? "";
    const imageUrl = book.cover?.medium ?? book.cover?.large ?? "";
    const category = guessCategory(title, publisher, subjects);

    return {
      title,
      description: [
        authors   ? `Autore: ${authors}`     : "",
        publisher ? `Editore: ${publisher}`  : "",
        year      ? `Anno: ${year}`           : "",
        subjects  ? `Soggetti: ${subjects}`  : "",
      ].filter(Boolean).join(" | "),
      category,
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

// Comic Vine — database fumetti (richiede API key)
async function searchComicVine(query: string): Promise<BarcodeResult[]> {
  const key = process.env.COMIC_VINE_API_KEY;
  if (!key) return [];
  try {
    const q = encodeURIComponent(query);

    // Cerca come volume (serie) — più utile per catalogare
    const url = `https://comicvine.gamespot.com/api/search/?api_key=${key}&format=json&query=${q}&resources=volume&field_list=id,name,publisher,description,image,start_year,count_of_issues&limit=10`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status_code !== 1) return [];

    const volumes: BarcodeResult[] = (data.results ?? []).map((item: Record<string, unknown>) => {
      const img = item.image as Record<string, string> | undefined;
      const pub = item.publisher as Record<string, string> | undefined;
      const desc = ((item.description as string) ?? "").replace(/<[^>]+>/g, "").substring(0, 400);
      return {
        title: (item.name as string) ?? "",
        description: desc || [
          pub?.name ? `Editore: ${pub.name}` : "",
          item.start_year ? `Dal ${item.start_year}` : "",
          item.count_of_issues ? `${item.count_of_issues} albi` : "",
        ].filter(Boolean).join(" · "),
        category: "fumetti",
        imageUrl: img?.medium_url ?? img?.small_url ?? "",
        publisher: pub?.name ?? "",
        year: (item.start_year as string) ?? "",
        found: true,
      } as BarcodeResult;
    });

    if (volumes.length > 0) return volumes;

    // Fallback: cerca come singolo issue
    const url2 = `https://comicvine.gamespot.com/api/search/?api_key=${key}&format=json&query=${q}&resources=issue&field_list=id,name,volume,description,image,cover_date&limit=10`;
    const res2 = await fetch(url2, { cache: "no-store" });
    if (!res2.ok) return [];
    const data2 = await res2.json();
    if (data2.status_code !== 1) return [];

    return (data2.results ?? []).map((item: Record<string, unknown>) => {
      const vol = item.volume as Record<string, string> | undefined;
      const img = item.image as Record<string, string> | undefined;
      const desc = ((item.description as string) ?? "").replace(/<[^>]+>/g, "").substring(0, 400);
      const year = ((item.cover_date as string) ?? "").substring(0, 4);
      const title = vol?.name ? `${vol.name} — ${item.name}` : ((item.name as string) ?? "");
      return {
        title,
        description: desc || (vol?.name ? `Serie: ${vol.name}` : ""),
        category: "fumetti",
        imageUrl: img?.medium_url ?? img?.small_url ?? "",
        year,
        found: true,
      } as BarcodeResult;
    });
  } catch {
    return [];
  }
}

// UPC Item DB — prodotti generici (DVD, videogiochi, oggetti)
async function lookupUPC(code: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`, {
      headers: { "Accept": "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item?.title) return null;

    const category = guessCategory(item.title, item.brand ?? "", item.category ?? "");
    return {
      title: item.title,
      description: [item.description, item.brand ? `Marca: ${item.brand}` : ""].filter(Boolean).join(" | "),
      category,
      imageUrl: item.images?.[0] ?? "",
      found: true,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const titleQuery = req.nextUrl.searchParams.get("title");

  // ── RICERCA PER TITOLO (fumetti, libri, ecc.) ──
  if (titleQuery) {
    // Prova Comic Vine per primo (migliore per fumetti)
    const cvResults = await searchComicVine(titleQuery);
    if (cvResults.length > 0) {
      return NextResponse.json({ ...cvResults[0], found: true, multiple: cvResults });
    }
    // Fallback Google Books (libri, manga, ecc.)
    const gbResults = await searchGoogleBooks(titleQuery, false);
    if (gbResults.length > 0) {
      return NextResponse.json({ ...gbResults[0], found: true, multiple: gbResults });
    }
    return NextResponse.json({ found: false, multiple: [], title: "", description: "", category: "fumetti" });
  }

  if (!code) return NextResponse.json({ error: "Parametro mancante" }, { status: 400 });

  // ── RICERCA PER CODICE A BARRE ──
  const isISBN = code.length === 10 || code.length === 13;

  if (isISBN) {
    const olResult = await lookupOpenLibrary(code);
    if (olResult) return NextResponse.json(olResult);

    const gbResults = await searchGoogleBooks(code, true);
    if (gbResults.length > 0) return NextResponse.json(gbResults[0]);
  }

  const upcResult = await lookupUPC(code);
  if (upcResult) return NextResponse.json(upcResult);

  return NextResponse.json({ found: false, title: "", description: "", category: "oggetti" });
}
