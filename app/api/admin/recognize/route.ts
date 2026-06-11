import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string", description: "Titolo completo del prodotto, incluso numero del volume/episodio se visibile" },
    category: { type: "string", enum: ["fumetti", "libri", "videogiochi", "dvd", "oggetti"] },
    suggested_price_eur: { type: "number", description: "Prezzo indicativo di mercato per l'usato in euro" },
  },
  required: ["title", "category", "suggested_price_eur"],
  additionalProperties: false,
};

export async function POST(req: NextRequest) {
  try {
    const { image, mediaType } = await req.json();
    if (!image) return NextResponse.json({ error: "Immagine mancante" }, { status: 400 });

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mediaType || "image/jpeg", data: image },
          },
          {
            type: "text",
            text: "Riconosci questo oggetto da collezione (fumetto, libro, videogioco, DVD o altro) e indica titolo, categoria e prezzo di mercato dell'usato.",
          },
        ],
      }],
      output_config: {
        format: { type: "json_schema", schema: SCHEMA },
      },
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "Nessuna risposta dal modello" }, { status: 500 });
    }
    const data = JSON.parse(textBlock.text);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Errore sconosciuto";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
