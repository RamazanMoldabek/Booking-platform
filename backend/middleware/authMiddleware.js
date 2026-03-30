// backend/middleware/authMiddleware.js
// Middleware для проверки JWT в каждом защищенном запросе.
// При успешной проверке добавляет `req.user` для последующих middleware.
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token is required.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Проверяем токен и берем из него данные пользователя.
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authorization token.' });
  }
};
