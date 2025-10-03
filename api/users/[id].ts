import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { User } from '../_lib/models/User';
import { setCors } from '../_lib/cors';
import { logRequest, logError } from '../_lib/logger';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    setCors(res);
    logRequest(req);

    console.log('Users API called with method:', req.method, 'query:', req.query, 'url:', req.url);

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    console.log('Attempting to connect to database...');
    await connectDB();
    console.log('Database connected successfully');

    const rawUserId = req.query.userId ?? req.query.id;
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    console.log('Looking up user with ID:', userId);

    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      console.error('Invalid userId:', rawUserId);
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId).select('-password');
    console.log('User found:', user ? 'yes' : 'no');

    if (!user) {
      console.error('User not found for ID:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    const responseData = {
      id: user._id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatarUrl,
      licenseNumber: user.licenseNumber,
      company: user.company,
      phone: user.phone,
      bio: user.bio,
      specialties: user.specialties,
      isRealtor: user.isRealtor,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('Returning user data for:', user.username);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Users API error:', error);
    logError(error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to fetch user profile', details: errorMessage });
  }
}