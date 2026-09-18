// Ricava il nome della testata (es. "Tex", "Zagor") dal titolo del prodotto.
// I titoli seguono lo schema "<Testata> n. <numero> — <storia>" oppure
// "<Testata> - <sottotitolo> n. <numero>": la testata è sempre la parte
// iniziale, prima del primo " - " o " n. <cifra>" che compare nel titolo.
export function estraiTestata(titleRaw: string): string {
  const title = titleRaw.trim();
  const idxDash = title.indexOf(" - ");
  const idxNum = title.search(/\sn\.\s*\d/i);

  let idx = -1;
  if (idxDash === -1) idx = idxNum;
  else if (idxNum === -1) idx = idxDash;
  else idx = Math.min(idxDash, idxNum);

  if (idx !== -1) return title.slice(0, idx).trim();

  // Titoli senza " - " né " n.": es. edizioni speciali con solo un numero finale
  const trailingNum = title.match(/^(.*?)\s+\d+$/);
  return trailingNum ? trailingNum[1].trim() : title;
}

// Individua se il titolo appartiene esplicitamente a una sottocollana
// "Collezione (Storica) a Colori" (fuori da eventuali parentesi: un
// "(a colori)" tra parentesi è solo una nota su un numero normale, non
// indica la sottocollana). Restituisce il nome normalizzato della frase,
// o null se il titolo non ne fa parte.
function fraseCollezione(title: string): string | null {
  const senzaParentesi = title.replace(/\([^)]*\)/g, "");
  if (/collezione\s+storica\s+a\s+colori/i.test(senzaParentesi)) return "Collezione Storica a Colori";
  if (/collezione\s+a\s+colori/i.test(senzaParentesi)) return "Collezione a Colori";
  return null;
}

// Classifica una lista di prodotti fumetti nella loro testata "espositiva":
// la serie regolare (es. "Tex") oppure, quando il titolo lo indica
// esplicitamente, la sottocollana a parte (es. "Zagor - Collezione Storica
// a Colori", "Il Comandante Mark - Collezione a Colori"). Ritorna una mappa
// id prodotto -> nome testata, così la stessa classificazione può essere
// usata sia per contare le testate sia per filtrare la lista di una testata.
export function classificaFumetti(prodotti: { id: string; title: string }[]): Map<string, string> {
  const risultato = new Map<string, string>();
  const basiConosciute = new Set<string>();

  // Passo 1: titoli senza sottocollana esplicita -> testata di base
  for (const p of prodotti) {
    if (fraseCollezione(p.title)) continue;
    const base = estraiTestata(p.title);
    basiConosciute.add(base);
    risultato.set(p.id, base);
  }

  const basiOrdinate = Array.from(basiConosciute).sort((a, b) => b.length - a.length);

  // Passo 2: titoli di sottocollana -> "<testata di base> - <sottocollana>"
  for (const p of prodotti) {
    if (risultato.has(p.id)) continue;
    const frase = fraseCollezione(p.title)!;
    const titleLower = p.title.trim().toLowerCase();
    const base = basiOrdinate.find(b =>
      titleLower === b.toLowerCase() || titleLower.startsWith(b.toLowerCase() + " ")
    ) ?? estraiTestata(p.title);
    risultato.set(p.id, `${base} - ${frase}`);
  }

  return risultato;
}
