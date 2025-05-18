const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017'; // conexão local
const dbName = 'agenda_db'; // nome do seu banco

const client = new MongoClient(uri);

async function connect() {
  try {
    await client.connect();
    return client.db(dbName);
  } catch (err) {
    console.error('Erro ao conectar ao MongoDB:', err);
    throw err;
  }
}

module.exports = connect;
