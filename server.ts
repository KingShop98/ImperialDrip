import express from 'express';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-imperial-drip';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

const app = express();
app.use(express.json());

// Payment Routes
  app.post('/api/create-payment-intent', async (req, res) => {
    try {
      const { items, total } = req.body;
      
      const stripe = getStripe();
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Stripe expects amounts in cents
        currency: 'eur',
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({ error: error.message || 'Error al procesar el pago' });
    }
  });

  // Auth Routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    
    try {
      const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (existingUser) {
        return res.status(400).json({ error: 'El correo ya está registrado' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
      const result = stmt.run(name, email, hashedPassword);
      
      const user = { id: result.lastInsertRowid, name, email, role: 'user' };
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ user, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    try {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      if (!user) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Credenciales inválidas' });
      }

      const { password: _, ...userWithoutPassword } = user;
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  });

  // API Routes
  app.get('/api/products', (req, res) => {
    const products = db.prepare('SELECT * FROM products').all();
    const variants = db.prepare('SELECT * FROM product_variants').all();
    
    const productsWithVariants = products.map((p: any) => ({
      ...p,
      variants: variants.filter((v: any) => v.product_id === p.id)
    }));
    
    res.json(productsWithVariants);
  });

  app.get('/api/products/:id', (req, res) => {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    const variants = db.prepare('SELECT * FROM product_variants WHERE product_id = ?').all(req.params.id);
    res.json({ ...product, variants });
  });

  app.post('/api/contact', (req, res) => {
    const { name, email, phone, message } = req.body;
    const stmt = db.prepare('INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)');
    stmt.run(name, email, phone, message);
    res.json({ success: true });
  });

  app.post('/api/discount/validate', (req, res) => {
    const { code } = req.body;
    const discount = db.prepare('SELECT * FROM discount_codes WHERE code = ?').get(code) as any;
    
    if (!discount) {
      return res.status(400).json({ error: 'Código inválido' });
    }
    
    if (discount.current_uses >= discount.max_uses) {
      return res.status(400).json({ error: 'Código agotado' });
    }
    
    res.json({ discount_percentage: discount.discount_percentage });
  });

  app.post('/api/checkout', (req, res) => {
    const { items, address, contact, email, total, discountCode } = req.body;
    
    const insertOrder = db.prepare('INSERT INTO orders (user_id, total, shipping_address, contact_number, email) VALUES (?, ?, ?, ?, ?)');
    const insertItem = db.prepare('INSERT INTO order_items (order_id, product_id, variant_id, quantity, price) VALUES (?, ?, ?, ?, ?)');
    
    const transaction = db.transaction(() => {
      const order = insertOrder.run(null, total, address, contact, email);
      const orderId = order.lastInsertRowid;
      
      for (const item of items) {
        insertItem.run(orderId, item.product_id, item.variant_id, item.quantity, item.price);
        
        // Update stock
        db.prepare('UPDATE product_variants SET stock = stock - ? WHERE id = ?').run(item.quantity, item.variant_id);
      }
      
      if (discountCode) {
        db.prepare('UPDATE discount_codes SET current_uses = current_uses + 1 WHERE code = ?').run(discountCode);
      }
      
      return orderId;
    });
    
    try {
      const orderId = transaction();
      res.json({ success: true, orderId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al procesar el pedido' });
    }
  });

  // Admin Routes
  app.get('/api/admin/stats', (req, res) => {
    const totalRevenue = db.prepare('SELECT SUM(total) as total FROM orders').get() as any;
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get() as any;
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get() as any;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    
    res.json({
      revenue: totalRevenue.total || 0,
      orders: totalOrders.count,
      products: totalProducts.count,
      users: totalUsers.count
    });
  });

  app.get('/api/admin/orders', (req, res) => {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    res.json(orders);
  });

  app.get('/api/admin/users', (req, res) => {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  });

  app.get('/api/admin/messages', (req, res) => {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
    res.json(messages);
  });

  app.delete('/api/admin/messages/:id', (req, res) => {
    db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/admin/products', (req, res) => {
    const { name, description, price, original_price, category, brand, image_url, is_featured, is_offer, variants } = req.body;
    
    const insertProduct = db.prepare('INSERT INTO products (name, description, price, original_price, category, brand, image_url, is_featured, is_offer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const insertVariant = db.prepare('INSERT INTO product_variants (product_id, size_or_ml, color, stock) VALUES (?, ?, ?, ?)');
    
    const transaction = db.transaction(() => {
      const product = insertProduct.run(name, description, price, original_price, category, brand, image_url, is_featured ? 1 : 0, is_offer ? 1 : 0);
      const productId = product.lastInsertRowid;
      
      if (variants && variants.length > 0) {
        for (const v of variants) {
          insertVariant.run(productId, v.size_or_ml, v.color, v.stock);
        }
      }
      
      return productId;
    });
    
    try {
      const productId = transaction();
      res.json({ success: true, id: productId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al crear producto' });
    }
  });

  app.put('/api/admin/products/:id', (req, res) => {
    const { name, description, price, original_price, category, brand, image_url, is_featured, is_offer, variants } = req.body;
    const productId = req.params.id;
    
    const updateProduct = db.prepare('UPDATE products SET name = ?, description = ?, price = ?, original_price = ?, category = ?, brand = ?, image_url = ?, is_featured = ?, is_offer = ? WHERE id = ?');
    const deleteVariants = db.prepare('DELETE FROM product_variants WHERE product_id = ?');
    const insertVariant = db.prepare('INSERT INTO product_variants (product_id, size_or_ml, color, stock) VALUES (?, ?, ?, ?)');
    
    const transaction = db.transaction(() => {
      updateProduct.run(name, description, price, original_price, category, brand, image_url, is_featured ? 1 : 0, is_offer ? 1 : 0, productId);
      
      deleteVariants.run(productId);
      
      if (variants && variants.length > 0) {
        for (const v of variants) {
          insertVariant.run(productId, v.size_or_ml, v.color, v.stock);
        }
      }
    });
    
    try {
      transaction();
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al actualizar producto' });
    }
  });

  app.delete('/api/admin/products/:id', (req, res) => {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Export app for Vercel Serverless Functions
  export default app;

  // Start server locally
  async function startServer() {
    if (process.env.VERCEL) return; // Skip local server start on Vercel

    const PORT = process.env.PORT || 3000;
    // Vite middleware for development or static files for production
    const distPath = path.join(__dirname, 'dist');
    const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(distPath);

    if (!isProd) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      // Serve static files in production
      app.use(express.static(distPath));
      
      // Handle SPA routing
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  startServer();
