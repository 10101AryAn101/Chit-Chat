import jwt from 'jsonwebtoken';

export function signToken(payload, secret, expiresIn = '7d') {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyToken(token, secret) {
  try { return jwt.verify(token, secret); } catch { return null; }
}
