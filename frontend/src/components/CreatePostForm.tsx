import React, { useState } from 'react';
import {
  Typography,
  Alert,
  Box,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Chip,
  type SelectChangeEvent,
} from '@mui/material';
import {
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  Add as AddIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PropertyDetailsForm from './PropertyDetailsForm';
import type { PostType, PropertyType, IndustryType } from '../../../shared/types';

interface CreatePostFormProps {
  onSubmit: (formData: CreatePostFormData) => Promise<void>;
  onCancel?: () => void;
  submitting: boolean;
  submitError: string;
  disabled?: boolean;
}

export interface CreatePostFormData {
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

const CreatePostForm: React.FC<CreatePostFormProps> = ({
  onSubmit,
  onCancel,
  submitting,
  submitError,
  disabled = false
}) => {
  // Form state
  const [content, setContent] = useState<string>("");
  const [type, setType] = useState<PostType>("NEED");
  const [image, setImage] = useState<File | null>(null);

  // Property details state
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [industry, setIndustry] = useState<IndustryType[]>([]);
  const [city, setCity] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [sizeUnit, setSizeUnit] = useState<"sqft" | "acres">("sqft");
  const [price, setPrice] = useState<string>("");

  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      return;
    }

    // Build propertyDetails object if any fields are filled
    const propertyDetails = (propertyType || industry.length > 0 || city || state || address || size || price) ? {
      propertyType: propertyType || undefined,
      industry: industry.length > 0 ? industry : undefined,
      location: (city || state || address) ? {
        city: city || undefined,
        state: state || undefined,
        address: address || undefined
      } : undefined,
      size: size ? parseFloat(size) : undefined,
      sizeUnit: size ? sizeUnit : undefined,
      price: price ? parseFloat(price) : undefined
    } : undefined;

    const formData: CreatePostFormData = {
      content: content.trim(),
      type,
      image: image || undefined,
      propertyDetails,
      tags: tags.length > 0 ? tags : undefined,
    };

    await onSubmit(formData);

    // Clear form on success
    setContent("");
    setType("NEED");
    setImage(null);
    setPropertyType("");
    setIndustry([]);
    setCity("");
    setState("");
    setAddress("");
    setSize("");
    setSizeUnit("sqft");
    setPrice("");
    setTags([]);
    setCurrentTag("");
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setType(event.target.value as PostType);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = currentTag.trim();
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags([...tags, tag]);
        setCurrentTag("");
      }
    }
  };

  const removeTag = (indexToRemove: number) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={1.5}>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="What's on your mind?"
          placeholder="Describe what you need or what you have to offer..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          required
          disabled={disabled}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          <FormControl sx={{ flex: 1 }} disabled={disabled}>
            <InputLabel>Post Type</InputLabel>
            <Select
              value={type}
              label="Post Type"
              onChange={handleTypeChange}
            >
              <MenuItem value="NEED">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <NeedIcon color="error" />
                  NEED
                </Box>
              </MenuItem>
              <MenuItem value="HAVE">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HaveIcon color="success" />
                  HAVE
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            sx={{ flex: 2 }}
            label="Tags (Optional)"
            placeholder="Add tags separated by commas"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            variant="outlined"
            disabled={disabled}
            helperText={`${tags.length}/10 tags`}
          />
        </Box>

        {tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                onDelete={() => removeTag(index)}
                size="small"
                color="primary"
                variant="outlined"
                disabled={disabled}
              />
            ))}
          </Box>
        )}

        <PropertyDetailsForm
          propertyType={propertyType}
          industry={industry}
          city={city}
          state={state}
          address={address}
          size={size}
          sizeUnit={sizeUnit}
          price={price}
          onPropertyTypeChange={setPropertyType}
          onIndustryChange={setIndustry}
          onCityChange={setCity}
          onStateChange={setState}
          onAddressChange={setAddress}
          onSizeChange={setSize}
          onSizeUnitChange={setSizeUnit}
          onPriceChange={setPrice}
          disabled={disabled}
        />

        {type === 'HAVE' && (
          <Box>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="image-upload"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImage(file);
              }}
              disabled={disabled}
            />
            <label htmlFor="image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoIcon />}
                sx={{ width: '100%' }}
                disabled={disabled}
              >
                {image ? `Selected: ${image.name}` : 'Add Image (Optional)'}
              </Button>
            </label>
            {image && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                File size: {(image.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            )}
          </Box>
        )}

        {submitError && (
          <Alert severity="error">
            {submitError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button
              onClick={onCancel}
              variant="outlined"
              disabled={submitting || disabled}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            startIcon={submitting ? <CircularProgress size={20} /> : <AddIcon />}
            disabled={submitting || disabled}
          >
            {submitting ? 'Posting...' : 'Post'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default CreatePostForm;