require('dotenv').config(); 
require('./config/env')();
const express = require('express');
const mongoose = require('mongoose');
require('./models/Category');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;



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

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    version: require('./package.json').version,
    uptime: Math.round(process.uptime()),
  });
});
app.use('/api/v1/products', productsRouter);

// 4. Connect to MongoDB, then start the server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      if (require.main === module) {
        app.listen(process.env.PORT || 3000, () => {
          console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
        });
      }
      module.exports = app;
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

const authRouter = require('./routes/auth');
app.use('/api/v1/auth', authRouter);
const tasksRouter = require('./routes/tasks');
app.use('/api/v1/tasks', tasksRouter);

app.use('/api/v1/uploads', require('./routes/uploads'));
app.use('/uploads', express.static('uploads'));
app.use(require('./middleware/errorHandler'));