CREATE VIRTUAL TABLE IF NOT EXISTS parties_fts USING fts5(name, phone, notes);
CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(name, sku);
CREATE VIRTUAL TABLE IF NOT EXISTS transactions_fts USING fts5(note);

CREATE TRIGGER IF NOT EXISTS parties_ai AFTER INSERT ON parties BEGIN
  INSERT INTO parties_fts(rowid, name, phone, notes) VALUES (new.id, new.name, new.phone, new.notes);
END;
CREATE TRIGGER IF NOT EXISTS parties_ad AFTER DELETE ON parties BEGIN
  DELETE FROM parties_fts WHERE rowid = old.id;
END;
CREATE TRIGGER IF NOT EXISTS parties_au AFTER UPDATE ON parties BEGIN
  DELETE FROM parties_fts WHERE rowid = old.id;
  INSERT INTO parties_fts(rowid, name, phone, notes) VALUES (new.id, new.name, new.phone, new.notes);
END;

CREATE TRIGGER IF NOT EXISTS products_ai AFTER INSERT ON products BEGIN
  INSERT INTO products_fts(rowid, name, sku) VALUES (new.id, new.name, new.sku);
END;
CREATE TRIGGER IF NOT EXISTS products_ad AFTER DELETE ON products BEGIN
  DELETE FROM products_fts WHERE rowid = old.id;
END;
CREATE TRIGGER IF NOT EXISTS products_au AFTER UPDATE ON products BEGIN
  DELETE FROM products_fts WHERE rowid = old.id;
  INSERT INTO products_fts(rowid, name, sku) VALUES (new.id, new.name, new.sku);
END;

CREATE TRIGGER IF NOT EXISTS transactions_ai AFTER INSERT ON transactions BEGIN
  INSERT INTO transactions_fts(rowid, note) VALUES (new.id, new.note);
END;
CREATE TRIGGER IF NOT EXISTS transactions_ad AFTER DELETE ON transactions BEGIN
  DELETE FROM transactions_fts WHERE rowid = old.id;
END;
CREATE TRIGGER IF NOT EXISTS transactions_au AFTER UPDATE ON transactions BEGIN
  DELETE FROM transactions_fts WHERE rowid = old.id;
  INSERT INTO transactions_fts(rowid, note) VALUES (new.id, new.note);
END;
