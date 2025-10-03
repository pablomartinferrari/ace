import jwt from 'jsonwebtoken';
import { IUser } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET env variable');

export function signToken(user: IUser) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (typeof payload === 'string' || !payload.id || !payload.email) {
      return null;
    }
    return { id: payload.id, email: payload.email };
  } catch {
    return null;
  }
}
