import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { User } from '../_lib/models/User';
import { signToken } from '../_lib/auth';
import { uploadImage } from '../_lib/cloudinary';
import { setCors } from '../_lib/cors';
import { logRequest, logError } from '../_lib/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  logRequest(req);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await connectDB();
    const { 
      username, 
      email, 
      password, 
      avatar,
      licenseNumber,
      company,
      phone,
      bio,
      specialties,
      isRealtor
    } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(409).json({ error: 'Email or username already exists' });

    // Handle avatar upload if provided
    let avatarUrl;
    if (avatar) {
      try {
        const result = await uploadImage(avatar);
        avatarUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Avatar upload failed:', uploadError);
        // Continue without avatar rather than failing registration
      }
    }

    const user = new User({ 
      username, 
      email, 
      password, 
      avatarUrl,
      licenseNumber,
      company,
      phone,
      bio,
      specialties,
      isRealtor
    });
    await user.save();
    
    const token = signToken(user);
    
    return res.status(201).json({
      token,
      user: {
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
      }
    });
  } catch (error) {
    logError(error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
