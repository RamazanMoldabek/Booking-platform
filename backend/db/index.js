require('dotenv').config();
const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL 
  ? { 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for Render/Supabase external connections
    }
  : {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'booking_db',
      password: process.env.DB_PASSWORD || '1234',
      port: process.env.DB_PORT || 5432,
    };

const pool = new Pool(poolConfig);

// Проверка подключения к базе данных при инициализации
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
