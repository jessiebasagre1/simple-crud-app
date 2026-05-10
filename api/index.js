const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Global connection cache
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null 
  };
}

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ PRODUCTION Mongoose Connection
async function dbConnect() {
  // If already connected, return
  if (cached.conn) {
    return cached.conn;
  }

  // If pending connection, wait
  if (cached.promise) {
    return await cached.promise;
  }

  // New connection
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,        // Disable mongoose buffering
      maxPoolSize: 10,             // Vercel connection limit
      serverSelectionTimeoutMS: 5000, // Fast fail
      socketTimeoutMS: 45000,      // Close sockets after 45s (Vercel timeout)
      family: 4                    // Use IPv4, skip IPv6
    });

    cached.conn = await cached.promise;
    console.log('✅ MongoDB Connected');
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    throw error;
  }
}

// Product Model
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  qty: { type: Number, required: true, min: 0 },
  price: { type: Number, required: true, min: 0 }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Middleware - Connect on EVERY request
app.use('*', async (req, res, next) => {
  try {
    await dbConnect();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Product API Working! 🚀',
    endpoints: ['GET /api/products', 'POST /api/products']
  });
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('GET /api/products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const product = new Product({
      name: req.body.name,
      qty: parseInt(req.body.qty),
      price: parseFloat(req.body.price)
    });
    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('POST /api/products:', error);
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ error: 'Product not found' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        qty: parseInt(req.body.qty),
        price: parseFloat(req.body.price)
      },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = app;