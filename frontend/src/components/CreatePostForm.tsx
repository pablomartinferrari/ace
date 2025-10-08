import React, { useState } from 'react';
import {
  Alert,
  Box,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Chip,
  type SelectChangeEvent,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import {
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import PropertyDetailsForm from './PropertyDetailsForm';
import type { PostType, PostStatus, PropertyType, IndustryType } from '../../../shared/types';

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
  const [status, setStatus] = useState<PostStatus>("active");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
      status,
      image: (type === 'HAVE' && selectedImage) ? selectedImage : undefined,
      propertyDetails,
      tags: tags.length > 0 ? tags : undefined,
    };

    await onSubmit(formData);

    // Clear form on success
    setContent("");
    setType("NEED");
    setStatus("active");
    setSelectedImage(null);
    setImagePreview(null);
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

  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatus(event.target.value as PostStatus);
  };

  // Get status options based on post type
  const getStatusOptions = (postType: PostType): PostStatus[] => {
    if (postType === 'HAVE') {
      return ['active', 'pending', 'sold', 'leased', 'withdrawn'];
    } else {
      return ['active', 'paused', 'closed'];
    }
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
  <Stack spacing={1.5} sx={{ pt: 1 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
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

            <FormControl sx={{ flex: 1 }} disabled={disabled}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={handleStatusChange}
              >
                {getStatusOptions(type).map((statusOption) => (
                  <MenuItem key={statusOption} value={statusOption}>
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </MenuItem>
                ))}
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

          {type === 'HAVE' && (
            <Box>
              {!selectedImage ? (
                <Paper
                  sx={{
                    p: 2,
                    border: '2px dashed #ccc',
                    textAlign: 'center',
                    cursor: disabled ? 'default' : 'pointer',
                    '&:hover': disabled ? {} : {
                      borderColor: '#999',
                      backgroundColor: 'rgba(0, 0, 0, 0.02)'
                    }
                  }}
                  onClick={() => !disabled && document.getElementById('image-upload')?.click()}
                >
                  <UploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Click to upload an image (optional)
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    PNG, JPG up to 5MB
                  </Typography>
                </Paper>
              ) : (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Paper sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    {imagePreview && (
                      <Box
                        component="img"
                        src={imagePreview}
                        alt="Preview"
                        sx={{
                          width: 60,
                          height: 60,
                          objectFit: 'cover',
                          borderRadius: 1
                        }}
                      />
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" noWrap>
                        {selectedImage.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={removeImage}
                      disabled={disabled}
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Paper>
                </Box>
              )}
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                disabled={disabled}
              />
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



          {submitError && (
            <Alert severity="error">
              {submitError}
            </Alert>
          )}
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2, borderTop: 1, borderColor: 'divider', mt: 2, flexShrink: 0 }}>
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
    </Box>
  );
};

export default CreatePostForm;