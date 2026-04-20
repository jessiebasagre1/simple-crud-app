const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('./product-model'); // Fixed import

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, '/'))); // Serve static files from 'public' folder
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://basagre2:<bluesky>@cluster0.slbwecg.mongodb.net/?appName=Cluster0')
    .then(() => console.log('MONGODB CONNECTED!'))
    .catch(error => console.error('MongoDB connection error:', error));

// Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const { name, qty, price } = req.body;
        const product = await Product.create({ name, qty, price });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found!' });
        }
        
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});