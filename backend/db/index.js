require('dotenv').config();
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('FATAL ERROR: DATABASE_URL environment variable is missing.');
  console.error('Пожалуйста, добавьте DATABASE_URL в ваш файл .env');
  process.exit(1);
}

const poolConfig = { 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
};

const pool = new Pool(poolConfig);


pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to Postgres database');
  release();
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
