-- Numero di telefono del cliente, raccolto al momento del pagamento.
-- Serve ai corrieri e per gli avvisi di giacenza delle Poste.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone text;
