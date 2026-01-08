const express = require('express');
const app = express();
const PORT = 3000;

const auth = require('./middleware/auth');
const jwt = require('jsonwebtoken');

app.use(express.static('public'));
app.use(express.json());

// Simple in-memory user list
const users = [];

// Register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  users.push({ username, password });
  res.json({ success: true });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, "secretKey123");
  res.json({ token });
});

// Mock data
let items = [
  { id: 1, name: "Item A", price: 10 },
  { id: 2, name: "Item B", price: 20 },
  { id: 3, name: "Item C", price: 30 }
];

// Get all items (public)
app.get('/api/items', (req, res) => {
  res.json(items);
});

// Get item by ID (public)
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id == req.params.id);
  res.json(item);
});

// Add new item (protected)
app.post('/api/items', auth, (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
    price: req.body.price
  };
  items.push(newItem);
  res.json(newItem);
});

// Update item (protected)
app.put('/api/items/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  const { name, price } = req.body;

  const item = items.find(i => i.id === id);
  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  item.name = name;
  item.price = price;

  res.json({ success: true, item });
});

// Delete item (protected)
app.delete('/api/items/:id', auth, (req, res) => {
  const id = Number(req.params.id);
  items = items.filter(i => i.id !== id);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`MyItemManager running on http://localhost:${PORT}`);
});
