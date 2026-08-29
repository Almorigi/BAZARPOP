-- Traccia quando è stata inviata al cliente la richiesta di recensione,
-- così il pulsante "Chiedi recensione" non ricompare dopo l'invio.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS review_requested_at timestamptz;
