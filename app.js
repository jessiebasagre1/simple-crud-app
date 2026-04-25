const express = require('express');
const mongoose = require('mongoose');
const Product = require('../product-model');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 Prevent multiple DB connections (VERY IMPORTANT in Vercel)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGODB_URI, {
            bufferCommands: false,
        }).then((mongoose) => mongoose);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

// Middleware to connect DB
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// Routes
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json({ success: true, data: products });
});

app.post('/api/products', async (req, res) => {
    const { name, qty, price } = req.body;
    const product = await Product.create({ name, qty, price });
    res.status(201).json(product);
});

app.get('/api/products/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Not found' });
    res.json(product);
});

app.put('/api/products/:id', async (req, res) => {
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );
    res.json(product);
});

app.delete('/api/products/:id', async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
});


module.exports = app;