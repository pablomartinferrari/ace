import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  Paper,
  CardMedia,
  Fab,
  Popover,
  Divider,
  IconButton,
  Link,
} from "@mui/material";
import {
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import type { Post, PostType } from '../../../shared/types';
import SearchAndFilterBar from './SearchAndFilterBar';
import CreatePostForm, { type CreatePostFormData } from './CreatePostForm';
import { postsService, type CreatePostData } from '../services/postsService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const getTypeIcon = (type: PostType) =>
  type === "NEED" ? <NeedIcon /> : <HaveIcon />;
const getTypeColor = (type: PostType) =>
  type === "NEED" ? "error" : "success";

const FeedDisplay: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<PostType | 'ALL'>('ALL');
  // Local state for create-post popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const posts = await postsService.fetchPosts();
        setPosts(posts);
      } catch (err: any) {
        setError(err.message || 'Error fetching posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);



  // Popover handlers

  // Submit new post
  const handleSubmit = async (formData: CreatePostFormData) => {
    if (!user) {
      throw new Error("You must be logged in to create a post.");
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      const createData: CreatePostData = {
        content: formData.content,
        type: formData.type,
        image: formData.image,
        propertyDetails: formData.propertyDetails,
        tags: formData.tags,
      };
      await postsService.createPost(createData, user.id);

      // After successful create, refetch posts
      const posts = await postsService.fetchPosts();
      setPosts(posts);

      handleClosePopover();
    } catch (err) {
      console.error("Error creating post:", err);
      setSubmitError("Failed to create post. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClosePopover = () => {
    setAnchorEl(null);
    setSubmitError("");
  };
  const open = Boolean(anchorEl);
  // derive filtered posts from local state
  const filteredPosts = posts.filter((post) => {
    const typeMatch =
      filterType === 'ALL' ? true : post.type === filterType;

    if (searchQuery.length < 3) {
      return typeMatch;
    }

    const searchLower = searchQuery.toLowerCase();

    // Search in content
    const contentMatch = post.content?.toLowerCase().includes(searchLower);

    // Search in username
    const userNameMatch = post.userName?.toLowerCase().includes(searchLower);

    // Search in tags (remove spaces, convert to lowercase)
    const tagsMatch = post.tags?.some(tag =>
      tag.replace(/\s+/g, '').toLowerCase().includes(searchLower)
    );

    // Search in property details
    const propertyTypeMatch = post.propertyDetails?.propertyType?.toLowerCase().includes(searchLower);
    const industryMatch = post.propertyDetails?.industry?.some(industry =>
      industry.toLowerCase().includes(searchLower)
    );
    const locationMatch = post.propertyDetails?.location &&
      ((post.propertyDetails.location.city?.toLowerCase().includes(searchLower)) ||
       (post.propertyDetails.location.state?.toLowerCase().includes(searchLower)) ||
       (post.propertyDetails.location.address?.toLowerCase().includes(searchLower)));

    const textMatch = contentMatch || userNameMatch || tagsMatch ||
                     propertyTypeMatch || industryMatch || locationMatch;

    return typeMatch && textMatch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header with ACE logo and slogan */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 3,
          mb: 2,
          bgcolor: 'transparent',
          borderRadius: 2,
          position: 'relative',
        }}
      >
        <IconButton
          onClick={toggleTheme}
          sx={{
            position: 'absolute',
            right: 16,
            color: 'text.primary',
          }}
          aria-label="toggle theme"
        >
          {isDark ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        <Box
          component="img"
          src="/ace.svg"
          alt="ACE Logo"
          sx={{
            height: 48,
            width: 'auto',
          }}
        />
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            textAlign: 'center',
            color: 'text.primary',
          }}
        >
          Be the ACE of deals!
        </Typography>
      </Box>

      <Box>
        <SearchAndFilterBar
          searchQuery={searchQuery}
          filterType={filterType}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilterType}
          onClearSearch={() => setSearchQuery('')}
        />

        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
              minHeight: 400,
            }}
          >
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <Card key={post.id} elevation={2} sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <PersonIcon />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        {post.userEmail ? (
                          <Link
                            href={`mailto:${post.userEmail}?subject=Re: ${encodeURIComponent(post.content.substring(0, 50))}${post.content.length > 50 ? '...' : ''}`}
                            sx={{
                              textDecoration: 'none',
                              color: 'primary.main',
                              fontWeight: 500,
                              '&:hover': {
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            {post.userName}
                          </Link>
                        ) : (
                          <Typography variant="subtitle2">{post.userName}</Typography>
                        )}
                      </Box>
                      <Chip
                        icon={getTypeIcon(post.type)}
                        label={post.type}
                        color={getTypeColor(post.type)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1" sx={{ mb: 1.5 }}>
                      {post.content}
                    </Typography>

                    {/* Compact Property Details - Inline */}
                    {post.propertyDetails && (
                      <Box sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        mb: 1.5,
                        alignItems: 'center'
                      }}>
                        {post.propertyDetails.propertyType && (
                          <Chip
                            icon={<span style={{ fontSize: '0.8rem' }}>🏢</span>}
                            label={post.propertyDetails.propertyType}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                        {post.propertyDetails.industry && post.propertyDetails.industry.length > 0 && (
                          <Chip
                            icon={<span style={{ fontSize: '0.8rem' }}>💼</span>}
                            label={post.propertyDetails.industry.slice(0, 2).join(', ')}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              borderColor: 'secondary.main',
                              color: 'secondary.main',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                        {post.propertyDetails.location && (post.propertyDetails.location.city || post.propertyDetails.location.state) && (
                          <Chip
                            icon={<span style={{ fontSize: '0.8rem' }}>📍</span>}
                            label={[post.propertyDetails.location.city, post.propertyDetails.location.state].filter(Boolean).join(', ')}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              borderColor: 'info.main',
                              color: 'info.main',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                        {post.propertyDetails.size && (
                          <Chip
                            icon={<span style={{ fontSize: '0.8rem' }}>📐</span>}
                            label={`${post.propertyDetails.size.toLocaleString()} ${post.propertyDetails.sizeUnit}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              borderColor: 'success.main',
                              color: 'success.main',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                        {post.propertyDetails.price && (
                          <Chip
                            icon={<span style={{ fontSize: '0.8rem' }}>💰</span>}
                            label={`$${post.propertyDetails.price.toLocaleString()}`}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              borderColor: 'warning.main',
                              color: 'warning.main',
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        )}
                      </Box>
                    )}

                    {/* Enhanced Tags Section */}
                    {post.tags && post.tags.length > 0 && (
                      <Box sx={{ mb: post.imageUrl ? 1.5 : 0 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {post.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={`#${tag}`}
                              size="small"
                              variant="filled"
                              sx={{
                                height: 22,
                                fontSize: '0.65rem',
                                fontWeight: 500,
                                bgcolor: isDark ? 'grey.700' : 'grey.300',
                                color: isDark ? 'grey.100' : 'grey.800',
                                borderRadius: 1,
                                '& .MuiChip-label': { px: 0.8, py: 0.2 }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {post.imageUrl && (
                      <CardMedia
                        component="img"
                        image={post.imageUrl}
                        alt="Post image"
                        sx={{
                          width: "100%",
                          height: 200,
                          objectFit: "cover",
                          borderRadius: 2,
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 200,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No results found. Try adjusting your search or filters.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Floating Action Button */}
          <Fab
            color="primary"
            onClick={handleOpenPopover}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1000,
            }}
            size="medium"
          >
            <AddIcon />
          </Fab>

          {/* Create Post Popover */}
          <Popover
            open={open}
            onClose={handleClosePopover}
            anchorOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "center",
              horizontal: "center",
            }}
            PaperProps={{
              sx: {
                width: { xs: "95vw", sm: 800 },
                maxWidth: 900,
                maxHeight: "90vh",
                overflowY: "auto",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                m: 0,
              },
            }}
            BackdropProps={{
              sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
            }}
          >
            <Paper sx={{ p: 2, position: 'relative' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h6">
                  Create New Post
                </Typography>
                <IconButton
                  onClick={handleClosePopover}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {submitError && <Alert severity="error">{submitError}</Alert>}
              <CreatePostForm
                onSubmit={handleSubmit}
                onCancel={handleClosePopover}
                submitting={submitting}
                submitError={submitError}
                disabled={submitting}
              />
            </Paper>
          </Popover>
        </>
        );


      </Box>
    </Box>
  );
};

export default FeedDisplay;
