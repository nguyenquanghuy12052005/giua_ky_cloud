require('dns').setServers(['8.8.8.8', '8.8.4.4']);
const { MongoClient } = require('mongodb');
const readClient = new MongoClient(process.env.MONGO_READ_URI);
const writeClient = new MongoClient(process.env.MONGO_WRITE_URI);

async function connectAll() {
  await Promise.all([readClient.connect(), writeClient.connect()]);
}
const readDb = () => readClient.db(process.env.DB_NAME);   // dùng cho find
const writeDb = () => writeClient.db(process.env.DB_NAME); // dùng cho insert
module.exports = { connectAll, readDb, writeDb, writeClient };