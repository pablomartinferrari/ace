// Shared types for ACE application

export type PostType = 'NEED' | 'HAVE';

// Backend Post interface (matches Mongoose model)
export interface IPost {
  _id: string;
  type: PostType;
  content: string;
  userId: string; // ObjectId as string
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// API response with populated user
export interface PostResponse {
  _id: string;
  type: PostType;
  content: string;
  userId: {
    _id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Frontend Post interface (transformed for components)
export interface Post {
  id: string;
  type: PostType;
  content: string;
  userName: string;
  createdAt: string;
  imageUrl?: string;
}