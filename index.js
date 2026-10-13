require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');

// MODELS

const Product = require('./models/Product');
const Category = require('./models/Category');
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    // ...inside the .then() after mongoose.connect():
    const electronics = await Category.create({ name: 'Electronics' });
    const testProduct = await Product.create({
      name: 'Test Keyboard',
      price: 49.99,
      category: electronics._id,
    });
    const populatedProduct = await Product.findById(testProduct._id).populate('category');
    console.log('Populated product:', populatedProduct);
  })
  .catch((err) => console.error('MongoDB connection error:', err));




const app = express();

app.use(express.json());

app.post('/api/products', (req, res) => {
  console.log('Body received:', req.body);
  res.status(201).json({ message: 'Product created', data: req.body });
});

const PORT = 3000;

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} — ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const productsRouter = require('./routes/products');

app.use('/api/v1/products', productsRouter);



