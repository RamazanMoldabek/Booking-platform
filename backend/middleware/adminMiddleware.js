// backend/middleware/adminMiddleware.js
// Middleware для проверки прав администратора.
// Используется после authMiddleware: сначала проверяется JWT, затем права.
module.exports = (req, res, next) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};
