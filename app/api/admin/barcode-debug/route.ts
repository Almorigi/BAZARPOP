import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.COMIC_VINE_API_KEY;
  const result: Record<string, unknown> = {
    keyPresent: !!key,
    keyLength: key?.length ?? 0,
  };

  if (!key) return NextResponse.json(result);

  try {
    const url = `https://comicvine.gamespot.com/api/search/?api_key=${key}&format=json&query=Dylan+Dog&resources=volume&limit=2`;
    const res = await fetch(url, { cache: "no-store" });
    result.httpStatus = res.status;
    result.httpOk = res.ok;
    const text = await res.text();
    result.rawResponse = text.substring(0, 500);
    try {
      const json = JSON.parse(text);
      result.statusCode = json.status_code;
      result.error = json.error;
      result.totalResults = json.number_of_total_results;
      result.resultsCount = json.results?.length ?? 0;
      result.firstTitle = json.results?.[0]?.name ?? null;
    } catch {
      result.parseError = "Non è JSON valido";
    }
  } catch (e) {
    result.fetchError = String(e);
  }

  return NextResponse.json(result);
}
