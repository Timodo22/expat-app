import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import db from './src/db/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- Auth Routes ---
  app.post('/api/auth/register', (req, res) => {
    const { email, password, role, firstName, lastName, serviceType, searchProfile } = req.body;
    const userId = 'user-' + Date.now();
    const clientId = 'client-' + Date.now();
    
    try {
      db.prepare('INSERT INTO Users (id, email, password, role) VALUES (?, ?, ?, ?)').run(userId, email, password, role);
      
      if (role === 'b2c') {
        db.prepare(`
          INSERT INTO Clients (id, user_id, first_name, last_name, service_type, search_profile)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(clientId, userId, firstName, lastName, serviceType, searchProfile || null);
      }
      
      res.status(201).json({ success: true, user: { id: userId, email, role } });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM Users WHERE email = ? AND password = ?').get(email, password) as any;
    if (user) {
      res.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });

  // --- API Routes ---
  app.get('/api/users', (req, res) => {
    res.json(db.prepare('SELECT id, email, role, created_at FROM Users').all());
  });

  app.get('/api/clients', (req, res) => {
    res.json(db.prepare('SELECT * FROM Clients ORDER BY created_at DESC').all());
  });

  app.post('/api/clients', (req, res) => {
    const { user_id, b2b_company_id, first_name, last_name, service_type } = req.body;
    const id = 'client-' + Date.now();
    try {
      db.prepare(`
        INSERT INTO Clients (id, user_id, b2b_company_id, first_name, last_name, service_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, user_id, b2b_company_id, first_name, last_name, service_type);
      res.status(201).json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/clients/:id/documents', (req, res) => {
    res.json(db.prepare('SELECT * FROM Documents WHERE client_id = ?').all(req.params.id));
  });

  app.post('/api/viewings', (req, res) => {
    const { client_id, property_address, agent_name, viewing_date } = req.body;
    const id = 'viewing-' + Date.now();
    try {
      db.prepare(`
        INSERT INTO Viewings (id, client_id, property_address, agent_name, viewing_date)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, client_id, property_address, agent_name, viewing_date);
      res.status(201).json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/viewings', (req, res) => {
    res.json(db.prepare('SELECT * FROM Viewings').all());
  });

  app.post('/api/invoices', (req, res) => {
    const { client_id, amount, type } = req.body;
    const id = 'inv-' + Date.now();
    try {
      db.prepare(`
        INSERT INTO Invoices (id, client_id, amount, type)
        VALUES (?, ?, ?, ?)
      `).run(id, client_id, amount, type);
      res.status(201).json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/invoices', (req, res) => {
    res.json(db.prepare('SELECT * FROM Invoices ORDER BY issued_at DESC').all());
  });

  app.post('/api/emails/send', (req, res) => {
    const { to, subject, body } = req.body;
    console.log(`[RESEND MOCK] Sending email to ${to}: ${subject}`);
    res.json({ success: true, message: 'Email sent (mocked)' });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
