const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const products = [
  { id: 1, name: 'Áo thun VELA', price: 199000, description: 'Áo thun cotton mềm mịn, phù hợp mọi ngày.' },
  { id: 2, name: 'Giày chạy bộ', price: 749000, description: 'Giày thể thao nhẹ, đàn hồi tốt.' },
  { id: 3, name: 'Balo du lịch', price: 399000, description: 'Balo chống nước, nhiều ngăn tiện dụng.' },
  { id: 4, name: 'Tai nghe không dây', price: 599000, description: 'Âm thanh rõ, pin lâu.' },
];

const users = [
  { email: 'admin@shop.com', password: 'Admin@123', role: 'admin', name: 'Admin' },
  { email: 'user@shop.com', password: 'User@123', role: 'user', name: 'User' },
  { email: 'test@shop.com', password: 'Test@123', role: 'user', name: 'Test' },
  { email: 'trandinhdinh@shop.com', password: '12345', role: 'user', name: 'Tran Dinh Dinh' },
];

const carts = {};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const product = products.find((item) => item.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(product);
});

app.get('/api/search', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json([]);
  }

  const result = products.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q),
  );

  res.json(result);
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((item) => item.email === email && item.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ email: user.email, role: user.role, name: user.name, token: `token-${user.email}` });
});

app.post('/api/register', (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (users.some((item) => item.email === email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  users.push({ email, password, role: 'user', name: name || 'User' });
  res.status(201).json({ message: 'User registered', email });
});

app.post('/api/cart', (req, res) => {
  const { email, productId, quantity = 1 } = req.body || {};

  if (!email || !productId) {
    return res.status(400).json({ error: 'Email and productId are required' });
  }

  const product = products.find((item) => item.id === Number(productId));
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  carts[email] = carts[email] || [];
  const existing = carts[email].find((item) => item.productId === product.id);

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    carts[email].push({ productId: product.id, quantity: Number(quantity), price: product.price });
  }

  res.json({ message: 'Added to cart', cart: carts[email] });
});

app.get('/api/cart', (req, res) => {
  const email = String(req.query.email || '');
  res.json(carts[email] || []);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
