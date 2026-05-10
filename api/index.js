const express = require('express');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ FAKE DATA (No MongoDB needed)
let products = [
  { _id: '1', name: 'iPhone 15', qty: 10, price: 59999 },
  { _id: '2', name: 'MacBook Pro', qty: 5, price: 129999 },
  { _id: '3', name: 'AirPods', qty: 25, price: 12999 }
];

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 🟢 API ROUTES (Fake DB)
app.get('/api/products', (req, res) => {
  res.json({ success: true, data: products });
});

app.post('/api/products', (req, res) => {
  const newProduct = {
    _id: Date.now().toString(),
    ...req.body,
    qty: parseInt(req.body.qty),
    price: parseFloat(req.body.price)
  };
  products.unshift(newProduct);
  res.status(201).json(newProduct);
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p._id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  products[index] = { ...products[index], ...req.body, qty: parseInt(req.body.qty), price: parseFloat(req.body.price) };
  res.json(products[index]);
});

app.delete('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p._id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Not found' });
  
  products.splice(index, 1);
  res.json({ message: 'Deleted' });
});

module.exports = app;