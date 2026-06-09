export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="text-6xl mb-6">📦</div>
      <h1 className="font-serif text-3xl font-bold text-accent mb-3">Sei offline</h1>
      <p className="text-neutral-400 max-w-sm mb-8">
        Sembra che tu non sia connesso a Internet. Riprova quando torni online.
      </p>
      <a href="/" className="bg-accent hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-2xl transition-colors">
        Torna alla Home
      </a>
    </div>
  );
}
