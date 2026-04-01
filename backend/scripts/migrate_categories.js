const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const db = require('../db');

const migrate = async () => {
  try {
    console.log('Starting migration...');

    // 1. Create Categories table
    await db.query(`
      CREATE TABLE IF NOT EXISTS Categories (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        name TEXT NOT NULL
      )
    `);

    // Check if 'name' column exists (in case table existed without it)
    const checkNameCol = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'categories' AND column_name = 'name'
    `);
    if (checkNameCol.rows.length === 0) {
      await db.query('ALTER TABLE Categories ADD COLUMN name TEXT DEFAULT \'\'');
      console.log('name column added to Categories table.');
    }
    console.log('Categories table ensured.');

    // 2. Insert default categories
    const categories = [
      ['cars', 'Машины'],
      ['special_tech', 'Спецтехника'],
      ['housing', 'Жилье'],
      ['events', 'Мероприятия']
    ];

    for (const [key, name] of categories) {
      await db.query(
        'INSERT INTO Categories (key, name) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING',
        [key, name]
      );
    }
    console.log('Default categories inserted.');

    // 3. Add category_id to services
    const checkCol = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'category_id'
    `);

    if (checkCol.rows.length === 0) {
      await db.query('ALTER TABLE services ADD COLUMN category_id INTEGER REFERENCES Categories(id)');
      console.log('category_id column added to services table.');
    } else {
      console.log('category_id column already exists.');
    }

    // 4. Also add 'images' column if missing (noticed in adminController)
    const checkImagesCol = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' AND column_name = 'images'
    `);

    if (checkImagesCol.rows.length === 0) {
      await db.query('ALTER TABLE services ADD COLUMN images TEXT[] DEFAULT \'{}\'');
      console.log('images column added to services table.');
    }

    // 5. Add 'rating', 'address', 'advantages', 'latitude', 'longitude' if missing
    const colsToAdd = [
      ['rating', 'NUMERIC DEFAULT 4.5'],
      ['address', 'TEXT'],
      ['advantages', 'JSONB DEFAULT \'[]\'::jsonb'],
      ['latitude', 'NUMERIC'],
      ['longitude', 'NUMERIC']
    ];

    for (const [col, type] of colsToAdd) {
      const check = await db.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'services' AND column_name = $1
      `, [col]);
      
      if (check.rows.length === 0) {
        await db.query(`ALTER TABLE services ADD COLUMN ${col} ${type}`);
        console.log(`${col} column added to services table.`);
      }
    }

    console.log('Migration finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
