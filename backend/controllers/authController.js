


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const TOKEN_EXPIRATION = '7d';

const createToken = (user) => {
  
  
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      is_admin: user.is_admin || false,
    },
    JWT_SECRET,
    {
      expiresIn: TOKEN_EXPIRATION,
    }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const insertQuery = 'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin';
    const { rows } = await db.query(insertQuery, [name.trim(), email.trim().toLowerCase(), passwordHash]);
    const user = rows[0];
    const token = createToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const query = 'SELECT id, name, email, password_hash, is_admin FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email.trim().toLowerCase()]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = createToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin }, token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
};
