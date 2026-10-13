require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

const authRouter = require('./routes/auth');
app.use('/api/v1/auth', authRouter);

// 1. Global Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} — ${req.method} ${req.url}`);
  next();
});

// 2. Base Routes
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});

// 3. Mount Module 6 Product CRUD Routes
const productsRouter = require('./routes/products');
app.use('/api/v1/products', productsRouter);

// 4. Connect to MongoDB, then start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });