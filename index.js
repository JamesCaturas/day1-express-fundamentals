const express = require('express');
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
app.use('/api/products', productsRouter);



