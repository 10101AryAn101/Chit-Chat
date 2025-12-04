import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  // Check Authorization header first, fallback to cookie
  let token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) token = req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  const decoded = verifyToken(token, process.env.JWT_SECRET);
  if (!decoded) return res.status(401).json({ message: 'Invalid token' });
  req.userId = decoded.userId;
  console.log(`Auth: Request to ${req.method} ${req.path} authenticated as userId: ${req.userId}`);
  next();
}
