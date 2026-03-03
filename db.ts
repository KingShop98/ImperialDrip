import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
export const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    original_price REAL,
    category TEXT,
    brand TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT 0,
    is_offer BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS product_variants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    size_or_ml TEXT,
    color TEXT,
    stock INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    total REAL,
    status TEXT DEFAULT 'pending',
    shipping_address TEXT,
    contact_number TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER,
    product_id INTEGER,
    variant_id INTEGER,
    quantity INTEGER,
    price REAL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    phone TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS discount_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    discount_percentage REAL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0
  );
`);

// Insert initial discount code
try {
  const stmt = db.prepare(`INSERT OR IGNORE INTO discount_codes (code, discount_percentage, max_uses) VALUES ('IMPERIAL10', 10, 10)`);
  stmt.run();
} catch (e) {}

// Insert admin user
try {
  const adminEmail = 'imperial.drip.sh@gmail.com';
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
  
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync('Y631435452s', 10);
    const adminStmt = db.prepare(`INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`);
    adminStmt.run('Admin', adminEmail, hashedPassword, 'admin');
  }
} catch (e) {
  console.error('Error creating admin user:', e);
}

// Insert some dummy products if empty
const count = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
if (count.count === 0) {
  const insertProduct = db.prepare(`INSERT INTO products (name, description, price, original_price, category, brand, image_url, is_featured, is_offer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertVariant = db.prepare(`INSERT INTO product_variants (product_id, size_or_ml, color, stock) VALUES (?, ?, ?, ?)`);

  // 1. Nike Air Force 1
  const p1 = insertProduct.run('Nike Air Force 1 \'07', 'Las icónicas Air Force 1 en color blanco. Estilo clásico y comodidad inigualable.', 119.99, 139.99, 'Zapatillas', 'Nike', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800', 1, 1);
  insertVariant.run(p1.lastInsertRowid, '41', 'Blanco', 10);
  insertVariant.run(p1.lastInsertRowid, '42', 'Blanco', 5);

  // 2. Nike Air Max 90
  const p2 = insertProduct.run('Nike Air Max 90', 'Un clásico reinventado. Las Air Max 90 combinan estilo retro con tecnología moderna.', 149.99, 149.99, 'Zapatillas', 'Nike', 'https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&q=80&w=800', 1, 0);
  insertVariant.run(p2.lastInsertRowid, '40', 'Negro/Blanco', 8);
  insertVariant.run(p2.lastInsertRowid, '41', 'Negro/Blanco', 12);

  // 3. Adidas Superstar
  const p3 = insertProduct.run('Adidas Superstar', 'Estilo urbano y atemporal. Las zapatillas que nunca pasan de moda.', 109.99, 129.99, 'Zapatillas', 'Adidas', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800', 0, 1);
  insertVariant.run(p3.lastInsertRowid, '39', 'Blanco/Negro', 15);

  // 4. Dior Sauvage
  const p4 = insertProduct.run('Dior Sauvage EDT', 'Fragancia fresca y noble. Una composición radicalmente fresca.', 89.99, 99.99, 'Perfumes', 'Dior', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800', 1, 1);
  insertVariant.run(p4.lastInsertRowid, '100ml', '', 20);

  // 5. Ropa Nike
  const p5 = insertProduct.run('Nike Tech Fleece Hoodie', 'Sudadera con capucha cómoda y cálida para el día a día.', 99.99, 99.99, 'Ropa', 'Nike', 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800', 0, 0);
  insertVariant.run(p5.lastInsertRowid, 'M', 'Gris', 10);
  insertVariant.run(p5.lastInsertRowid, 'L', 'Gris', 8);
}
