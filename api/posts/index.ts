import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { Post } from '../_lib/models/Post';
import { User } from '../_lib/models/User';
import { verifyToken } from '../_lib/auth';
import { uploadImage } from '../_lib/cloudinary';
import { setCors } from '../_lib/cors';
import { logRequest, logError } from '../_lib/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  logRequest(req);

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    if (req.method === 'GET') {
      // Filtering
      const { userId, type, q } = req.query;
      const filter: any = {};
      if (userId) filter.userId = userId;
      if (type) filter.type = type;
      if (q) filter.content = { $regex: q, $options: 'i' };
      const posts = await Post.find(filter).sort({ createdAt: -1 }).populate('userId', 'username email avatarUrl');
      return res.status(200).json(posts);
    }
    if (req.method === 'POST') {
      // Auth
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
      const token = auth.replace('Bearer ', '');
      const payload = verifyToken(token);
      if (!payload) return res.status(401).json({ error: 'Invalid token' });
      const user = await User.findById(payload.id);
      if (!user) return res.status(401).json({ error: 'User not found' });

      // Validation
      const { type, status, content, image, propertyDetails, tags } = req.body;
      if (!type || !content) return res.status(400).json({ error: 'Missing required fields' });
      if (!['NEED', 'HAVE'].includes(type)) return res.status(400).json({ error: 'Invalid type' });
      
      // Validate status if provided
      if (status) {
        const allowedStatuses = type === 'HAVE' 
          ? ['active', 'pending', 'sold', 'leased', 'withdrawn']
          : ['active', 'paused', 'closed'];
        
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status for this post type' });
        }
      }

      // Validate propertyDetails if provided
      if (propertyDetails) {
        const { propertyType, industry, location, size, sizeUnit, price } = propertyDetails;
        if (propertyType && !['Office', 'Retail', 'Industrial', 'Land', 'Multifamily'].includes(propertyType)) {
          return res.status(400).json({ error: 'Invalid property type' });
        }
        if (industry && !Array.isArray(industry)) {
          return res.status(400).json({ error: 'Industry must be an array' });
        }
        if (industry && industry.some((ind: string) => !['Healthcare', 'Logistics', 'Food & Beverage', 'Technology', 'Manufacturing', 'Hospitality', 'Financial Services', 'Education', 'Other'].includes(ind))) {
          return res.status(400).json({ error: 'Invalid industry type' });
        }
        if (location && (!location.city || !location.state)) {
          return res.status(400).json({ error: 'Location must include city and state' });
        }
        if (size && (typeof size !== 'number' || size <= 0)) {
          return res.status(400).json({ error: 'Size must be a positive number' });
        }
        if (sizeUnit && !['sqft', 'acres'].includes(sizeUnit)) {
          return res.status(400).json({ error: 'Invalid size unit' });
        }
        if (price && (typeof price !== 'number' || price < 0)) {
          return res.status(400).json({ error: 'Price must be a non-negative number' });
        }
      }

      // Validate tags if provided
      if (tags) {
        if (!Array.isArray(tags)) {
          return res.status(400).json({ error: 'Tags must be an array' });
        }
        if (tags.some((tag: any) => typeof tag !== 'string' || tag.trim().length === 0)) {
          return res.status(400).json({ error: 'All tags must be non-empty strings' });
        }
        if (tags.length > 10) {
          return res.status(400).json({ error: 'Maximum 10 tags allowed' });
        }
      }

      let imageUrl;
      if (type === 'HAVE' && image) {
        const result = await uploadImage(image);
        imageUrl = result.secure_url;
      }

      const post = new Post({
        type,
        status: status || 'active',
        content,
        userId: user._id,
        imageUrl,
        propertyDetails,
        tags,
      });
      await post.save();
      await post.populate('userId', 'username email avatarUrl');
      return res.status(201).json(post);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    logError(error);
    return res.status(500).json({ error: 'Request failed' });
  }
}
