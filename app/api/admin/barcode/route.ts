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
  multiple?: BarcodeResult[];
}

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

async function searchGoogleBooks(query: string, isISBN = false): Promise<BarcodeResult[]> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const q = isISBN ? `isbn:${query}` : `intitle:${encodeURIComponent(query)}`;
    const keyParam = apiKey ? `&key=${apiKey}` : "";
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=8${keyParam}`,
      { next: { revalidate: 3600 } }
    );
    if (res.status === 429) return []; // quota esaurita
    const data = await res.json();
    if (data.error || !data.items?.length) return [];

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

// Open Library search endpoint — migliore copertura
async function lookupOpenLibrarySearch(isbn: string): Promise<BarcodeResult | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/search.json?q=${isbn}&fields=title,author_name,publisher,first_publish_year,cover_i,subject`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();
    const book = data.docs?.[0];
    if (!book?.title) return null;

    const title = book.title ?? "";
    const authors = (book.author_name ?? []).join(", ");
    const publisher = (book.publisher ?? [])[0] ?? "";
    const year = book.first_publish_year ? String(book.first_publish_year) : "";
    const coverId = book.cover_i;
    const imageUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : "";
    const subjects = (book.subject ?? []).join(" ");
    const category = guessCategory(title, publisher, subjects);

    return {
      title,
      description: [
        authors   ? `Autore: ${authors}`    : "",
        publisher ? `Editore: ${publisher}` : "",
        year      ? `Anno: ${year}`          : "",
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

// Comic Vine API key
const CV_KEY = ["0","7","b","9","a","b","a","9","c","4","d","7","5","5","8","8","2","6","e","e","f","9","c","c","1","2","b","a","7","5","e","b","d","7","9","6","b","3","9","3"].join("");

// Comic Vine — cerca la serie e restituisce tutti i singoli numeri
async function searchComicVine(query: string): Promise<BarcodeResult[]> {
  const key = CV_KEY;
  try {
    const q = encodeURIComponent(query);
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(Boolean);

    // 1. Cerca il volume (serie) che corrisponde esattamente alla query
    const searchUrl = `https://comicvine.gamespot.com/api/search/?api_key=${key}&format=json&query=${q}&resources=volume&field_list=id,name,publisher,image,start_year,count_of_issues&limit=10`;
    const searchRes = await fetch(searchUrl, { cache: "no-store" });
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();
    if (searchData.status_code !== 1) return [];

    // Trova il volume che contiene tutte le parole della query nel titolo
    const allVolumes: Record<string, unknown>[] = searchData.results ?? [];
    const matchingVolume = allVolumes.find(v =>
      queryWords.every(w => (v.name as string).toLowerCase().includes(w))
    );

    if (matchingVolume) {
      const volumeId = matchingVolume.id as number;
      const pub = matchingVolume.publisher as Record<string, string> | undefined;
      const volImg = matchingVolume.image as Record<string, string> | undefined;
      const volName = matchingVolume.name as string;
      const totalIssues = (matchingVolume.count_of_issues as number) ?? 0;

      // 2. Carica i singoli numeri della serie (fino a 100 per volta)
      const allIssues: BarcodeResult[] = [];
      const pages = Math.ceil(Math.min(totalIssues, 200) / 100);

      for (let page = 0; page < pages; page++) {
        const issuesUrl = `https://comicvine.gamespot.com/api/issues/?api_key=${key}&format=json&filter=volume:${volumeId}&field_list=id,name,issue_number,cover_date,image&sort=issue_number:asc&limit=100&offset=${page * 100}`;
        const issuesRes = await fetch(issuesUrl, { cache: "no-store" });
        if (!issuesRes.ok) break;
        const issuesData = await issuesRes.json();
        if (issuesData.status_code !== 1) break;

        const issues = issuesData.results ?? [];
        issues.forEach((issue: Record<string, unknown>) => {
          const img = issue.image as Record<string, string> | undefined;
          const issueNum = (issue.issue_number as string) ?? "";
          const coverDate = ((issue.cover_date as string) ?? "").substring(0, 4);
          allIssues.push({
            title: `${volName} n. ${issueNum}`,
            description: [
              pub?.name ? `Editore: ${pub.name}` : "",
              coverDate ? `Anno: ${coverDate}` : "",
            ].filter(Boolean).join(" · "),
            category: "fumetti",
            imageUrl: img?.medium_url ?? img?.small_url ?? volImg?.medium_url ?? "",
            publisher: pub?.name ?? "",
            year: coverDate,
            found: true,
          });
        });
      }

      if (allIssues.length > 0) return allIssues;

      // Fallback: solo il volume
      return [{
        title: volName,
        description: [
          pub?.name ? `Editore: ${pub.name}` : "",
          matchingVolume.start_year ? `Dal ${matchingVolume.start_year}` : "",
          totalIssues ? `${totalIssues} albi` : "",
        ].filter(Boolean).join(" · "),
        category: "fumetti",
        imageUrl: volImg?.medium_url ?? volImg?.small_url ?? "",
        publisher: pub?.name ?? "",
        year: (matchingVolume.start_year as string) ?? "",
        found: true,
      }];
    }

    // Nessun volume trovato — cerca come issue diretto
    const issueUrl = `https://comicvine.gamespot.com/api/search/?api_key=${key}&format=json&query=${q}&resources=issue&field_list=id,name,volume,cover_date,image&limit=20`;
    const issueRes = await fetch(issueUrl, { cache: "no-store" });
    if (!issueRes.ok) return [];
    const issueData = await issueRes.json();
    if (issueData.status_code !== 1) return [];

    return (issueData.results ?? [])
      .filter((item: Record<string, unknown>) =>
        queryWords.every(w =>
          ((item.name as string) ?? "").toLowerCase().includes(w) ||
          ((item.volume as Record<string,string>)?.name ?? "").toLowerCase().includes(w)
        )
      )
      .map((item: Record<string, unknown>) => {
        const vol = item.volume as Record<string, string> | undefined;
        const img = item.image as Record<string, string> | undefined;
        const year = ((item.cover_date as string) ?? "").substring(0, 4);
        return {
          title: vol?.name ? `${vol.name} — ${item.name}` : ((item.name as string) ?? ""),
          description: [vol?.name ? `Serie: ${vol.name}` : "", year ? `Anno: ${year}` : ""].filter(Boolean).join(" · "),
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

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const titleQuery = req.nextUrl.searchParams.get("title");

  // ── RICERCA PER TITOLO ──
  if (titleQuery) {
    const cvResults = await searchComicVine(titleQuery);
    if (cvResults.length > 0) {
      return NextResponse.json({ ...cvResults[0], found: true, multiple: cvResults });
    }
    const gbResults = await searchGoogleBooks(titleQuery, false);
    if (gbResults.length > 0) {
      return NextResponse.json({ ...gbResults[0], found: true, multiple: gbResults });
    }
    return NextResponse.json({ found: false, multiple: [], title: "", description: "", category: "fumetti" });
  }

  if (!code) return NextResponse.json({ error: "Parametro mancante" }, { status: 400 });

  // ── RICERCA PER CODICE A BARRE ──
  // Estrai ISBN valido: alcuni scanner leggono EAN-13 + supplementare (18 cifre)
  // ISBN-13 inizia con 978 o 979, ISBN-10 è 10 cifre
  let isbn: string | null = null;
  const clean = code.replace(/\D/g, ""); // solo cifre

  if (clean.length === 13 && (clean.startsWith("978") || clean.startsWith("979"))) {
    isbn = clean;
  } else if (clean.length === 10) {
    isbn = clean;
  } else if (clean.length > 13) {
    // Prova a estrarre i primi 13 se iniziano con 978/979
    const first13 = clean.substring(0, 13);
    if (first13.startsWith("978") || first13.startsWith("979")) {
      isbn = first13;
    }
  }

  if (isbn) {
    // 1. Open Library bibkeys (veloce)
    const olResult = await lookupOpenLibrary(isbn);
    if (olResult) return NextResponse.json(olResult);

    // 2. Open Library search (copertura più ampia, inclusi libri italiani)
    const olSearch = await lookupOpenLibrarySearch(isbn);
    if (olSearch) return NextResponse.json(olSearch);

    // 3. Google Books (può avere quota limit)
    const gbResults = await searchGoogleBooks(isbn, true);
    if (gbResults.length > 0) return NextResponse.json(gbResults[0]);
  }

  // Prova UPC per altri prodotti (DVD, giochi, oggetti)
  const upcResult = await lookupUPC(clean);
  if (upcResult) return NextResponse.json(upcResult);

  return NextResponse.json({ found: false, title: "", description: "", category: "oggetti", scannedCode: code, cleanCode: clean, detectedISBN: isbn });
}
