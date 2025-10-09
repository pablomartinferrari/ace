import { getAuthHeader } from '../utils/auth';
import type { Post, PostType, PostStatus, PropertyType, IndustryType, PropertyDetails } from '../../../shared/types';

export interface CreatePostData {
  content: string;
  type: PostType;
  status: PostStatus;
  image?: File;
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
}

export interface ApiPostResponse {
  _id: string;
  type: PostType;
  status: PostStatus;
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

export interface UpdatePostData {
  status?: PostStatus;
  price?: number;
  tags?: string[];
  image?: File | null; // File for new image, null to remove image
}

export interface PostsService {
  fetchPosts(): Promise<Post[]>;
  createPost(formData: CreatePostData, userId: string): Promise<Post>;
  updatePost(postId: string, updateData: UpdatePostData): Promise<Post>;
}

type CreatePostRequestBody = {
  content: string;
  type: PostType;
  status: PostStatus;
  userId: string;
  propertyDetails?: CreatePostData['propertyDetails'];
  tags?: string[];
};

// Mock data for development
const mockPosts: Post[] = [
  {
    id: '1',
    type: 'NEED',
    status: 'active',
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
    status: 'active',
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
    status: 'active',
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
    status: 'pending',
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
    status: 'paused',
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
      status: apiPost.status || 'active',
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

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
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
      const apiUrl = this.getApiUrl();
      const token = localStorage.getItem('token');

      // Use FormData if image is provided, otherwise use JSON
      if (formData.image && formData.type === 'HAVE') {
        const formDataPayload = new FormData();
        formDataPayload.append('content', formData.content);
        formDataPayload.append('type', formData.type);
        formDataPayload.append('status', formData.status);
        formDataPayload.append('userId', userId);
        formDataPayload.append('image', formData.image);

        if (formData.propertyDetails) {
          formDataPayload.append('propertyDetails', JSON.stringify(formData.propertyDetails));
        }

        if (formData.tags) {
          formDataPayload.append('tags', JSON.stringify(formData.tags));
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
          body: formDataPayload,
        });

        if (!response.ok) {
          throw new Error('Failed to create post');
        }

        const apiPost: ApiPostResponse = await response.json();
        return this.transformApiPost(apiPost);
      } else {
        // Use JSON for posts without images
        const requestBody: CreatePostRequestBody = {
          content: formData.content,
          type: formData.type,
          status: formData.status,
          userId,
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
      }
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error('Failed to create post. Please try again.');
    }
  }

  async updatePost(postId: string, updateData: UpdatePostData): Promise<Post> {
    try {
      const apiUrl = `${this.getApiUrl()}/${postId}`;
      const token = localStorage.getItem('token');

      // Convert image to base64 if provided, then use JSON (same as POST pattern)
      if (updateData.image !== undefined) {
        let imageBase64: string | null = null;
        
        if (updateData.image) {
          // Convert File to base64
          imageBase64 = await this.fileToBase64(updateData.image);
        }
        // If updateData.image is null/empty, imageBase64 remains null for removal

        const requestBody = {
          status: updateData.status,
          price: updateData.price,
          tags: updateData.tags,
          image: imageBase64
        };

        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error('Failed to update post');
        }

        const apiPost: ApiPostResponse = await response.json();
        return this.transformApiPost(apiPost);
      } else {
        // Use JSON for updates without image changes
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          throw new Error('Failed to update post');
        }

        const apiPost: ApiPostResponse = await response.json();
        return this.transformApiPost(apiPost);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      throw new Error('Failed to update post. Please try again.');
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

    // Generate a mock image URL if image was provided and it's a HAVE post
    let imageUrl: string | undefined;
    if (formData.image && formData.type === 'HAVE') {
      // In real implementation, this would be uploaded to cloud storage
      imageUrl = URL.createObjectURL(formData.image);
    }

    const newPost: Post = {
      id: Date.now().toString(),
      type: formData.type,
      status: formData.status || 'active',
      content: formData.content,
      userName: 'Mock User',
      userId: _userId, // Use the provided userId
      createdAt: new Date().toISOString(),
      imageUrl,
      propertyDetails: formData.propertyDetails as PropertyDetails,
      tags: formData.tags
    };

    this.posts.unshift(newPost); // Add to beginning of array
    console.log('MockPostsService: Created new post:', newPost);
    return newPost;
  }

  async updatePost(postId: string, updateData: UpdatePostData): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, this.delay));

    const postIndex = this.posts.findIndex(post => post.id === postId);
    if (postIndex === -1) {
      throw new Error('Post not found');
    }

    const updatedPost: Post = {
      ...this.posts[postIndex],
      ...updateData
    };

    // Handle price update (nested in propertyDetails)
    if (updateData.price !== undefined && updatedPost.propertyDetails) {
      updatedPost.propertyDetails = {
        ...updatedPost.propertyDetails,
        price: updateData.price
      };
    }

    // Handle tags update
    if (updateData.tags !== undefined) {
      updatedPost.tags = updateData.tags;
    }

    // Handle image update (only for HAVE posts)
    if (updateData.image !== undefined && updatedPost.type === 'HAVE') {
      if (updateData.image) {
        // Generate a mock image URL for new uploads
        updatedPost.imageUrl = URL.createObjectURL(updateData.image);
      } else {
        // Remove image
        updatedPost.imageUrl = undefined;
      }
    }

    this.posts[postIndex] = updatedPost;
    console.log('MockPostsService: Updated post:', updatedPost);
    return updatedPost;
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