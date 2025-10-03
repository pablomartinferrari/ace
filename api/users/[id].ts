import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { User } from '../_lib/models/User';
import { setCors } from '../_lib/cors';
import { logRequest, logError } from '../_lib/logger';
import { verifyToken } from '../_lib/auth';
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
    if (req.method !== 'GET' && req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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

    if (req.method === 'PUT') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token required' });
      }

      const token = authHeader.slice(7);
      const payload = verifyToken(token);

      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      if (payload.id !== userId) {
        return res.status(403).json({ error: 'You can only update your own profile' });
      }

      let body = req.body as Record<string, unknown> | string | undefined;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (parseError) {
          console.error('Failed to parse JSON body for user update:', parseError);
          return res.status(400).json({ error: 'Invalid JSON payload' });
        }
      }

      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: 'Request body is required' });
      }

      const allowedFields = [
        'username',
        'email',
        'avatarUrl',
        'licenseNumber',
        'company',
        'phone',
        'bio',
        'specialties',
        'isRealtor',
      ] as const;

      const updates: Record<string, unknown> = {};

      allowedFields.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(body!, field)) {
          const value = (body as Record<string, unknown>)[field];

          if (field === 'specialties') {
            if (Array.isArray(value)) {
              updates.specialties = value
                .filter((item): item is string => typeof item === 'string')
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
            } else if (typeof value === 'string') {
              updates.specialties = value
                .split(',')
                .map((item) => item.trim())
                .filter((item) => item.length > 0);
            }
          } else if (typeof value === 'string') {
            updates[field] = value.trim();
          } else if (value !== undefined) {
            updates[field] = value;
          }
        }
      });

      if (typeof (body as Record<string, unknown>).avatar === 'string') {
        updates.avatarUrl = (body as Record<string, unknown>).avatar;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'No valid fields provided for update' });
      }

      const updatedUser = await User.findByIdAndUpdate(userId, updates, {
        new: true,
        runValidators: true,
        context: 'query',
      }).select('-password');

      if (!updatedUser) {
        console.error('User not found for update:', userId);
        return res.status(404).json({ error: 'User not found' });
      }

      const updatedResponse = {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        avatarUrl: updatedUser.avatarUrl,
        licenseNumber: updatedUser.licenseNumber,
        company: updatedUser.company,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        specialties: updatedUser.specialties,
        isRealtor: updatedUser.isRealtor,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      };

      return res.status(200).json(updatedResponse);
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