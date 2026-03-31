const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    await client.connect();
    console.log('Connected to DB');

    const query = `
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS advantages JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS address TEXT;
    `;

    await client.query(query);
    console.log('Migration successful: added columns images, advantages, address');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

migrate();
