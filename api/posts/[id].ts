import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectDB } from '../_lib/db';
import { Post } from '../_lib/models/Post';
import { User } from '../_lib/models/User';
import { verifyToken } from '../_lib/auth';
import { uploadImage } from '../_lib/cloudinary';
import { setCors } from '../_lib/cors';
import { logRequest, logError } from '../_lib/logger';

// Configure Vercel to handle body parsing
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCors(res);
  logRequest(req);

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    await connectDB();
    
    const { id: postId } = req.query;
    if (!postId) return res.status(400).json({ error: 'Post ID is required' });

    if (req.method === 'PUT') {
      // Auth
      const auth = req.headers.authorization;
      if (!auth) return res.status(401).json({ error: 'Missing Authorization header' });
      const token = auth.replace('Bearer ', '');
      const payload = verifyToken(token);
      if (!payload) return res.status(401).json({ error: 'Invalid token' });
      const user = await User.findById(payload.id);
      if (!user) return res.status(401).json({ error: 'User not found' });

      // Find the post
      const post = await Post.findById(postId);
      if (!post) return res.status(404).json({ error: 'Post not found' });

      // Check ownership
      if (post.userId.toString() !== user._id.toString()) {
        return res.status(403).json({ error: 'Not authorized to update this post' });
      }

      // Parse request body - same pattern as POST endpoint
      const { status, price, tags, image } = req.body;
      
      // Debug logging
      console.log('Request body keys:', Object.keys(req.body || {}));
      console.log('Status:', status);
      console.log('Price:', price);  
      console.log('Tags:', tags);
      console.log('Image provided:', !!image);
      
      if (status) {
        const allowedStatuses = post.type === 'HAVE' 
          ? ['active', 'pending', 'sold', 'leased', 'withdrawn']
          : ['active', 'paused', 'closed'];
        
        if (!allowedStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status for this post type' });
        }
        
        post.status = status;
      }

      if (price !== undefined) {
        if (typeof price !== 'number' || price < 0) {
          return res.status(400).json({ error: 'Price must be a non-negative number' });
        }
        
        if (post.propertyDetails) {
          post.propertyDetails.price = price;
          post.markModified('propertyDetails');
        } else {
          return res.status(400).json({ error: 'Cannot set price - post has no property details' });
        }
      }

      if (tags !== undefined) {
        if (!Array.isArray(tags)) {
          return res.status(400).json({ error: 'Tags must be an array' });
        }
        
        if (tags.some((tag: any) => typeof tag !== 'string' || tag.trim().length === 0)) {
          return res.status(400).json({ error: 'All tags must be non-empty strings' });
        }
        
        if (tags.length > 10) {
          return res.status(400).json({ error: 'Maximum 10 tags allowed' });
        }
        
        post.tags = tags.map((tag: string) => tag.trim());
      }

      // Handle image updates - same pattern as POST endpoint
      if (post.type === 'HAVE' && image !== undefined) {
        if (image && image !== '' && image !== null) {
          // Upload new image (image should be base64 string)
          const result = await uploadImage(image);
          post.imageUrl = result.secure_url;
        } else if (image === '' || image === null) {
          // Remove existing image
          post.imageUrl = undefined;
        }
      }

      await post.save();
      await post.populate('userId', 'username email avatarUrl');
      return res.status(200).json(post);
    }

    if (req.method === 'GET') {
      // Get single post by ID
      const post = await Post.findById(postId).populate('userId', 'username email avatarUrl');
      if (!post) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json(post);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    logError(error);
    return res.status(500).json({ error: 'Request failed' });
  }
}