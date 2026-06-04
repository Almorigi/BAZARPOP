-- Aggiunge la categoria DVD alla tabella products
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_category_check;
ALTER TABLE products ADD CONSTRAINT products_category_check
  CHECK (category IN ('fumetti', 'libri', 'videogiochi', 'oggetti', 'dvd'));
