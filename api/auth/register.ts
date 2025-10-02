import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { User } from '../_lib/models/User';
import { setCors } from '../_lib/cors';
import { logRequest, logError } from '../_lib/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  logRequest(req);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const { username, email, password, avatarUrl } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: 'Email or username already exists' });

    const user = new User({ username, email, password, avatarUrl });
    await user.save();
    return res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
