import { getAuthHeader } from '../utils/auth';
import type { Post, PostType, PropertyType, IndustryType, PropertyDetails } from '../../../shared/types';

export interface CreatePostData {
  content: string;
  type: PostType;
  propertyDetails?: {
    propertyType?: PropertyType;
    industry?: IndustryType[];
    location?: {
      city?: string;
      state?: string;
      address?: string;
    };
    size?: number;
    sizeUnit?: 'sqft' | 'acres';
    price?: number;
  };
  tags?: string[];
  image?: File;
}

export interface ApiPostResponse {
  _id: string;
  type: PostType;
  content: string;
  userId: {
    _id: string;
    username: string;
    email?: string;
    avatarUrl?: string;
  };
  createdAt: string;
  imageUrl?: string;
  propertyDetails?: PropertyDetails;
  tags?: string[];
}

export interface PostsService {
  fetchPosts(): Promise<Post[]>;
  createPost(formData: CreatePostData, userId: string): Promise<Post>;
}

type CreatePostRequestBody = {
  content: string;
  type: PostType;
  userId: string;
  image: string | null;
  propertyDetails?: CreatePostData['propertyDetails'];
  tags?: string[];
};

// Mock data for development
const mockPosts: Post[] = [
  {
    id: '1',
    type: 'NEED',
    content: 'Looking for a 2,000 sq ft office space in downtown area. Budget up to $5,000/month.',
    userName: 'John Smith',
    userEmail: 'john.smith@email.com',
    userAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    userId: 'user1',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    propertyDetails: {
      propertyType: 'Office',
      industry: ['Technology', 'Financial Services'],
      location: {
        city: 'New York',
        state: 'NY',
        address: 'Manhattan'
      },
      size: 2000,
      sizeUnit: 'sqft',
      price: 5000
    },
    tags: ['urgent', 'downtown', 'flexible']
  },
  {
    id: '2',
    type: 'HAVE',
    content: 'Available: 5,000 sq ft industrial warehouse with loading dock. Perfect for logistics company.',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@email.com',
    userAvatarUrl: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    userId: 'user2',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&h=300&fit=crop',
    propertyDetails: {
      propertyType: 'Industrial',
      industry: ['Logistics', 'Manufacturing'],
      location: {
        city: 'Los Angeles',
        state: 'CA',
        address: 'Industrial District'
      },
      size: 5000,
      sizeUnit: 'sqft',
      price: 8000
    },
    tags: ['warehouse', 'loading-dock', 'industrial']
  },
  {
    id: '3',
    type: 'NEED',
    content: 'Seeking retail space for a coffee shop. Around 1,200 sq ft, high foot traffic area preferred.',
    userName: 'Mike Chen',
    userEmail: 'mike.chen@email.com',
    userAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    userId: 'user3',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    propertyDetails: {
      propertyType: 'Retail',
      industry: ['Food & Beverage'],
      location: {
        city: 'Chicago',
        state: 'IL'
      },
      size: 1200,
      sizeUnit: 'sqft'
    },
    tags: ['retail', 'food-service', 'foot-traffic']
  },
  {
    id: '4',
    type: 'HAVE',
    content: 'Beautiful 3-acre land parcel available for development. Zoned for multifamily residential.',
    userName: 'David Wilson',
    userEmail: 'david.wilson@email.com',
    userAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    userId: 'user4',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop',
    propertyDetails: {
      propertyType: 'Land',
      industry: ['Other'],
      location: {
        city: 'Austin',
        state: 'TX',
        address: 'Suburban area'
      },
      size: 3,
      sizeUnit: 'acres',
      price: 250000
    },
    tags: ['land', 'development', 'multifamily']
  },
  {
    id: '5',
    type: 'NEED',
    content: 'Healthcare provider looking for medical office space. Need exam rooms and waiting area.',
    userName: 'Dr. Emily Davis',
    userEmail: 'emily.davis@email.com',
    userAvatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    userId: 'user5',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    propertyDetails: {
      propertyType: 'Office',
      industry: ['Healthcare'],
      location: {
        city: 'Seattle',
        state: 'WA'
      },
      size: 1500,
      sizeUnit: 'sqft'
    },
    tags: ['healthcare', 'medical-office', 'exam-rooms']
  }
];

// API-based service implementation
class ApiPostsService implements PostsService {
  private getApiUrl(): string {
    return import.meta.env.PROD ? '/api/posts' : 'http://localhost:3000/api/posts';
  }

  private transformApiPost(apiPost: ApiPostResponse): Post {
    return {
      id: apiPost._id,
      type: apiPost.type,
      content: apiPost.content,
      userName: apiPost.userId?.username || 'Unknown User',
      userEmail: apiPost.userId?.email,
      userAvatarUrl: apiPost.userId?.avatarUrl, // Add user avatar URL
      userId: apiPost.userId?._id, // Add userId for profile navigation
      createdAt: apiPost.createdAt,
      imageUrl: apiPost.imageUrl,
      propertyDetails: apiPost.propertyDetails,
      tags: apiPost.tags
    };
  }

  async fetchPosts(): Promise<Post[]> {
    try {
      const apiUrl = this.getApiUrl();
      console.log('ApiPostsService: Fetching posts from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          ...getAuthHeader()
        }
      });

      console.log('ApiPostsService: Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }

      const data: ApiPostResponse[] = await response.json();
      console.log('ApiPostsService: Received data:', data.length, 'posts');

      const transformed = data.map(this.transformApiPost);
      console.log('ApiPostsService: First post userId:', transformed[0]?.userId);

      return transformed;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new Error('Failed to load posts. Please check your connection and try again.');
    }
  }

  async createPost(formData: CreatePostData, userId: string): Promise<Post> {
    try {
      // Convert image to base64 if present
      let imageBase64 = null;
      if (formData.image) {
        imageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(formData.image!);
        });
      }

      const apiUrl = this.getApiUrl();
      const token = localStorage.getItem('token');

      const requestBody: CreatePostRequestBody = {
        content: formData.content,
        type: formData.type,
        userId,
        image: imageBase64,
      };

      if (formData.propertyDetails) {
        requestBody.propertyDetails = formData.propertyDetails;
      }

      if (formData.tags) {
        requestBody.tags = formData.tags;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const apiPost: ApiPostResponse = await response.json();
      return this.transformApiPost(apiPost);
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post. Please try again.');
    }
  }
}

// Mock service implementation for development
class MockPostsService implements PostsService {
  private posts = [...mockPosts];
  private delay = 500; // Simulate network delay

  async fetchPosts(): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    console.log('MockPostsService: Returning mock posts:', this.posts.length);
    return [...this.posts];
  }

  async createPost(formData: CreatePostData, _userId: string): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, this.delay));

    const newPost: Post = {
      id: Date.now().toString(),
      type: formData.type,
      content: formData.content,
      userName: 'Mock User',
      userId: _userId, // Use the provided userId
      createdAt: new Date().toISOString(),
      imageUrl: formData.image ? URL.createObjectURL(formData.image) : undefined,
      propertyDetails: formData.propertyDetails as PropertyDetails,
      tags: formData.tags
    };

    this.posts.unshift(newPost); // Add to beginning of array
    console.log('MockPostsService: Created new post:', newPost);
    return newPost;
  }
}

// Factory function to create the appropriate service
function createPostsService(): PostsService {
  // Check if we should use mock data
  const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

  console.log('Creating posts service, useMock:', useMock, 'DEV:', import.meta.env.DEV, 'VITE_USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);

  return useMock ? new MockPostsService() : new ApiPostsService();
}

// Export singleton instance
export const postsService = createPostsService();