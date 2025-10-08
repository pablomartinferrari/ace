import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Link,
  CardMedia,
  TextField,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
} from '@mui/icons-material';
import type { Post, PostStatus, PostType } from '../../../shared/types';
import { postsService } from '../services/postsService';
import { useAuth } from '../contexts/useAuth';

interface PostDetailModalProps {
  post: Post | null;
  open: boolean;
  onClose: () => void;
  onPostUpdated?: (updatedPost: Post) => void;
}

const getTypeIcon = (type: PostType) =>
  type === "NEED" ? <NeedIcon /> : <HaveIcon />;
const getTypeColor = (type: PostType) =>
  type === "NEED" ? "error" : "success";

const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  open,
  onClose,
  onPostUpdated
}) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<PostStatus>('active');
  const [editedPrice, setEditedPrice] = useState<number | ''>('');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [tagInputValue, setTagInputValue] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (post) {
      setEditedStatus(post.status || 'active');
      setEditedPrice(post.propertyDetails?.price || '');
      setEditedTags(post.tags || []);
      setTagInputValue((post.tags || []).join(', '));
    }
  }, [post]);

  if (!post) return null;

  const isOwner = user && user.id === post.userId;
  
  // Enhanced debug logging
  console.log('PostDetailModal - Debug:', {
    hasUser: !!user,
    user: user,
    userId: user?.id,
    userIdType: typeof user?.id,
    postUserId: post.userId,
    postUserIdType: typeof post.userId,
    isOwner: isOwner,
    strictEqual: user?.id === post.userId,
    looseEqual: user?.id == post.userId,
    viewport: window.innerWidth + 'x' + window.innerHeight,
    userAgent: navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'
  });

  // Get status options based on post type
  const getStatusOptions = (postType: PostType): PostStatus[] => {
    if (postType === 'HAVE') {
      return ['active', 'pending', 'sold', 'leased', 'withdrawn'];
    } else {
      return ['active', 'paused', 'closed'];
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedStatus(post.status || 'active');
    setEditedPrice(post.propertyDetails?.price || '');
    setEditedTags(post.tags || []);
    setTagInputValue((post.tags || []).join(', '));
    setError('');
  };

  const handleSave = async () => {
    if (!user || !isOwner) return;
    
    setSaving(true);
    setError('');
    
    try {
      const updateData: any = {
        status: editedStatus
      };
      
      // Only include price if it's different from current and is a valid number
      const currentPrice = post.propertyDetails?.price;
      const newPrice = editedPrice === '' ? undefined : Number(editedPrice);
      if (newPrice !== currentPrice && newPrice !== undefined && !isNaN(newPrice)) {
        updateData.price = newPrice;
      }
      
      // Only include tags if they're different from current
      const currentTags = post.tags || [];
      if (JSON.stringify(editedTags.sort()) !== JSON.stringify(currentTags.sort())) {
        updateData.tags = editedTags;
      }

      const updatedPost = await postsService.updatePost(post.id, updateData);
      
      // Update local state to reflect the changes immediately
      setEditedStatus(updatedPost.status || 'active');
      setEditedPrice(updatedPost.propertyDetails?.price || '');
      setEditedTags(updatedPost.tags || []);
      setTagInputValue((updatedPost.tags || []).join(', '));
      
      setIsEditing(false);
      onPostUpdated?.(updatedPost);
      
    } catch (err) {
      console.error('Error updating post:', err);
      setError('Failed to update post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        sx={{
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          maxHeight: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          transform: 'none',
          borderRadius: 0,
          m: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6">
            Post Details
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isOwner && !isEditing && (
              <IconButton onClick={handleEdit} size="small">
                <EditIcon />
              </IconButton>
            )}
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ 
          flex: 1, 
          p: 2, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {/* Image Section - Only for HAVE posts */}
          {post.type === 'HAVE' && post.imageUrl && (
            <Box sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                image={post.imageUrl}
                alt="Post image"
                sx={{
                  width: '100%',
                  maxHeight: 200,
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            </Box>
          )}

          {/* User Info and Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Avatar src={post.userAvatarUrl} sx={{ width: 40, height: 40 }}>
              {!post.userAvatarUrl && <PersonIcon />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              {post.userEmail ? (
                <Link
                  href={`mailto:${post.userEmail}?subject=Re: ${encodeURIComponent(post.content.substring(0, 50))}${post.content.length > 50 ? '...' : ''}`}
                  underline="hover"
                  variant="subtitle1"
                >
                  {post.userName}
                </Link>
              ) : (
                <Typography variant="subtitle1">
                  {post.userName}
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary">
                {new Date(post.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                icon={getTypeIcon(post.type)}
                label={post.type}
                color={getTypeColor(post.type)}
                size="small"
              />
              {isEditing ? (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editedStatus}
                    label="Status"
                    onChange={(e) => setEditedStatus(e.target.value as PostStatus)}
                  >
                    {getStatusOptions(post.type).map((statusOption) => (
                      <MenuItem key={statusOption} value={statusOption}>
                        {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Chip
                  label={post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Active'}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 1.5 }} />

          {/* Content */}
          <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.5 }}>
            {post.content}
          </Typography>

          {/* Property Details */}
          {post.propertyDetails && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Property Details
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {post.propertyDetails.propertyType && (
                  <Chip
                    icon={<span style={{ fontSize: '0.75rem' }}>🏢</span>}
                    label={post.propertyDetails.propertyType}
                    size="small"
                    variant="outlined"
                  />
                )}
                {post.propertyDetails.industry && post.propertyDetails.industry.length > 0 && (
                  <Chip
                    icon={<span style={{ fontSize: '0.75rem' }}>💼</span>}
                    label={post.propertyDetails.industry.join(', ')}
                    size="small"
                    variant="outlined"
                  />
                )}
                {post.propertyDetails.location && (
                  <Chip
                    icon={<span style={{ fontSize: '0.75rem' }}>📍</span>}
                    label={`${post.propertyDetails.location.city}, ${post.propertyDetails.location.state}`}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {post.propertyDetails.size && (
                  <Chip
                    icon={<span style={{ fontSize: '0.75rem' }}>📐</span>}
                    label={`${post.propertyDetails.size.toLocaleString()} ${post.propertyDetails.sizeUnit}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {isEditing && isOwner ? (
                  <TextField
                    label="Price ($)"
                    type="number"
                    size="small"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    sx={{ minWidth: 120 }}
                    inputProps={{ min: 0 }}
                  />
                ) : (
                  post.propertyDetails.price && (
                    <Chip
                      icon={<span style={{ fontSize: '0.75rem' }}>💰</span>}
                      label={`$${post.propertyDetails.price.toLocaleString()}`}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  )
                )}
              </Box>
            </Box>
          )}

          {/* Tags */}
          {((isEditing && isOwner) || (post.tags && post.tags.length > 0)) && (
            <Box sx={{ mt: 'auto' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Tags
              </Typography>
              {isEditing && isOwner ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <TextField
                    label="Tags (comma separated)"
                    size="small"
                    value={tagInputValue}
                    onChange={(e) => {
                      setTagInputValue(e.target.value);
                    }}
                    onBlur={(e) => {
                      // Split and clean tags on blur
                      const tags = e.target.value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
                      setEditedTags(tags);
                      setTagInputValue(tags.join(', '));
                    }}
                    onKeyDown={(e) => {
                      // Allow splitting on Enter as well
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const tags = tagInputValue.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
                        setEditedTags(tags);
                        setTagInputValue(tags.join(', '));
                      }
                    }}
                    placeholder="tag1, tag2, tag3"
                    helperText="Separate tags with commas, press Enter or click outside to add (max 10 tags)"
                  />
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {editedTags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={`#${tag}`}
                        size="small"
                        onDelete={() => {
                          const newTags = editedTags.filter((_, i) => i !== index);
                          setEditedTags(newTags);
                          setTagInputValue(newTags.join(', '));
                        }}
                        sx={(theme) => ({
                          bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200],
                        })}
                      />
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {post.tags?.map((tag, index) => (
                    <Chip
                      key={index}
                      label={`#${tag}`}
                      size="small"
                      sx={(theme) => ({
                        bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[200],
                      })}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Footer - Edit Actions */}
        {isOwner && isEditing && (
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-end',
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              onClick={handleCancelEdit}
              variant="outlined"
              startIcon={<CancelIcon />}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        )}
      </Paper>
    </Modal>
  );
};

export default PostDetailModal;