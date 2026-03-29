const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function inspect() {
  console.log('Starting inspection...');
  try {
    const tables = ['services', 'bookings', 'payments'];
    for (const table of tables) {
      console.log(`Checking table: ${table}`);
      const { rows } = await pool.query(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
        [table]
      );
      if (rows.length === 0) {
        console.log(`Table ${table} not found or has no columns.`);
      } else {
        console.log(`Columns for ${table}:`);
        rows.forEach(col => console.log(` - ${col.column_name} (${col.data_type})`));
      }
    }
  } catch (err) {
    console.error('Inspection failed:', err.message);
  } finally {
    await pool.end();
    console.log('Inspection finished.');
  }
}

inspect();
