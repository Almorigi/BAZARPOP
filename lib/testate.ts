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
