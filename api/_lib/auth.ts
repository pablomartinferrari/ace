import jwt from 'jsonwebtoken';
import { IUser } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET env variable');

export function signToken(user: IUser) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
