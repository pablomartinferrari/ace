import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IPost extends Document {
  type: 'NEED' | 'HAVE';
  content: string;
  userId: Types.ObjectId;
  imageUrl?: string;
  propertyDetails?: {
    propertyType: 'Office' | 'Retail' | 'Industrial' | 'Land' | 'Multifamily';
    industry: ('Healthcare' | 'Logistics' | 'Food & Beverage' | 'Technology' | 'Manufacturing' | 'Hospitality' | 'Financial Services' | 'Education' | 'Other')[];
    location: {
      city: string;
      state: string;
      address?: string;
    };
    size?: number;
    sizeUnit?: 'sqft' | 'acres';
    price?: number;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema: Schema<IPost> = new Schema({
  type: { type: String, enum: ['NEED', 'HAVE'], required: true },
  content: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String },
  propertyDetails: {
    propertyType: { type: String, enum: ['Office', 'Retail', 'Industrial', 'Land', 'Multifamily'] },
    industry: [{ type: String, enum: ['Healthcare', 'Logistics', 'Food & Beverage', 'Technology', 'Manufacturing', 'Hospitality', 'Financial Services', 'Education', 'Other'] }],
    location: {
      city: { type: String },
      state: { type: String },
      address: { type: String }
    },
    size: { type: Number },
    sizeUnit: { type: String, enum: ['sqft', 'acres'] },
    price: { type: Number }
  },
  tags: [{ type: String }]
}, { timestamps: true });

export const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
