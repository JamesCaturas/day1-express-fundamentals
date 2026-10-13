require('dotenv').config();
const { MongoClient } = require('mongodb');

async function testConnection() {
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas successfully!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.close();
  }
}

testConnection();
