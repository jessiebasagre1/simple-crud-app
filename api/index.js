const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Product = require('./models/Product');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files FIRST
app.use(express.static(path.join(__dirname, '../public')));

// MongoDB Connection Pool (Vercel Optimized)
let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.error('❌ MONGODB_URI missing!');
      throw new Error('MONGODB_URI environment variable is required');
    }
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      useNewUrlParser: true,
      useUnifiedTopology: true
    }).then(m => {
      console.log('✅ MongoDB Connected');
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 🟢 GET ALL PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    console.error('GET Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🟢 CREATE PRODUCT
app.post('/api/products', async (req, res) => {
  try {
    await connectDB();
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('POST Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// 🟢 GET SINGLE PRODUCT
app.get('/api/products/:id', async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 🟡 UPDATE PRODUCT
app.put('/api/products/:id', async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('PUT Error:', error);
    res.status(400).json({ error: error.message });
  }
});

// 🔴 DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = app;