// Shared types for the ACE application
// Used by both frontend and backend for API communication

export type PostType = 'NEED' | 'HAVE';

export type PropertyType = 'Office' | 'Retail' | 'Industrial' | 'Land' | 'Multifamily';

export type IndustryType = 'Healthcare' | 'Logistics' | 'Food & Beverage' | 'Technology' | 'Manufacturing' | 'Hospitality' | 'Financial Services' | 'Education' | 'Other';

export interface Location {
  city: string;
  state: string;
  address?: string;
}

export interface PropertyDetails {
  propertyType: PropertyType;
  industry: IndustryType[];
  location: Location;
  size?: number; // in square feet
  sizeUnit?: 'sqft' | 'acres';
  price?: number; // in USD
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
  propertyDetails?: PropertyDetails;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Frontend component interface (transformed data)
export interface Post {
  id: string;
  type: PostType;
  content: string;
  userName: string;
  userEmail?: string;
  createdAt: string;
  imageUrl?: string;
  propertyDetails?: PropertyDetails;
  tags?: string[];
}