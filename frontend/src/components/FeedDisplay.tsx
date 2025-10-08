import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Container,
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
  Tooltip,
} from "@mui/material";
import {
  ShoppingCart as NeedIcon,
  CheckCircle as HaveIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha, useTheme as useMuiTheme } from "@mui/material/styles";
import type { Post, PostType } from '../../../shared/types';
import SearchAndFilterBar from './SearchAndFilterBar';
import CreatePostForm, { type CreatePostFormData } from './CreatePostForm';
import ErrorDisplay from './ErrorDisplay';
import PostDetailModal from './PostDetailModal';
import { postsService, type CreatePostData } from '../services/postsService';
import { useAuth } from '../contexts/useAuth';
import { useTheme } from '../contexts/useTheme';
import NavigationBar from './NavigationBar';

const ACRES_TO_SQFT = 43560;

const getSizeInSqft = (details?: Post['propertyDetails']): number | null => {
  if (!details?.size || Number.isNaN(details.size)) return null;
  if (details.sizeUnit === 'acres') {
    return details.size * ACRES_TO_SQFT;
  }
  return details.size;
};

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
  const [filterPrice, setFilterPrice] = useState('ALL');
  const [filterSize, setFilterSize] = useState('ALL');
  // Local state for create-post popover
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  
  // Local state for post detail modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const { user } = useAuth();
  const { isDark } = useTheme();
  const muiTheme = useMuiTheme();
  const isLargeScreen = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const navigate = useNavigate();

  // Smart search normalization function
  const normalizeSearchTerm = (term: string): string => {
    return term
      .toLowerCase()
      .replace(/[.,]/g, '') // Remove periods and commas
      .replace(/\bst\b/g, 'saint') // st -> saint
      .replace(/\bst\./g, 'saint') // st. -> saint
      .replace(/\bmt\b/g, 'mount') // mt -> mount
      .replace(/\bmt\./g, 'mount') // mt. -> mount
      .replace(/\bft\b/g, 'fort') // ft -> fort
      .replace(/\bft\./g, 'fort') // ft. -> fort
      .trim();
  };

  // Smart search parsing function
  const parseSmartSearch = (query: string) => {
    const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
    const normalizedTerms = terms.map(normalizeSearchTerm);

    // Known property types
    const propertyTypes = ['office', 'retail', 'industrial', 'land', 'multifamily'];

    // Common US states and their abbreviations
    const states = {
      'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
      'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
      'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
      'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
      'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
      'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
      'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
      'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
      'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
      'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
    };

    const stateAbbreviations = Object.values(states);
    const stateNames = Object.keys(states);

    // Common cities (expandable list)
    const commonCities = [
      'orlando', 'miami', 'tampa', 'jacksonville', 'tallahassee', 'saint petersburg', 'saint cloud',
      'fort lauderdale', 'cape coral', 'pembroke pines', 'hollywood', 'gainesville', 'coral springs',
      'clearwater', 'miami beach', 'palm bay', 'west palm beach', 'lakeland', 'davie', 'miami gardens',
      'plantation', 'sunrise', 'wellington', 'boynton beach', 'delray beach', 'boca raton', 'naples',
      'pompano beach', 'deerfield beach', 'parkland', 'coconut creek', 'fort myers', 'winter garden',
      'sarasota', 'coral gables', 'bonita springs', 'pinellas park', 'winter park', 'aventura',
      'university park', 'doral', 'cutler bay', 'oakland park', 'north lauderdale', 'lauderdale lakes',
      'lauderhill', 'palm springs', 'hialeah gardens', 'dania beach', 'hallandale beach', 'miami lakes',
      'sweetwater', 'bay harbor islands', 'surfside', 'bal harbour', 'golden beach', 'indian creek',
      'pinecrest', 'palmetto bay', 'cutler', 'south miami', 'gladeview', 'fisher island', 'key biscayne',
      'north bay village', 'el portal', 'miami shores', 'biscayne park', 'miami springs', 'virginia gardens',
      'west miami', 'brownsville', 'gladeview', 'model city', 'little haiti', 'upper east side',
      'design district', 'wynwood', 'midtown', 'brickell', 'downtown miami', 'coconut grove',
      'coral way', 'the roads', 'south beach', 'lincoln road', 'bal harbour shops', 'bonaventure',
      'pinecrest', 'palmetto bay', 'redland', 'homestead', 'florida city', 'key largo', 'islamorada',
      'marathon', 'key west', 'big pine key', 'summerland key', 'cudjoe key', 'sugarloaf key',
      'ramrod key', 'little torch key', 'middle torch key', 'big torch key', 'stock island',
      'key haven', 'cudjoe key', 'sugarloaf key', 'ramrod key', 'little torch key', 'middle torch key',
      'big torch key', 'stock island', 'key haven', 'geiger key', 'fleming key', 'windley key',
      'plantain key', 'grassy key', 'marathon', 'duck key', 'conch key', 'long key', 'layton',
      'islamorada', 'tavernier', 'key largo', 'oceanside', 'anglers park', 'rock harbor', 'plantations',
      'oceanside', 'anglers park', 'rock harbor', 'plantations', 'mandarin', 'baymeadows', 'beaches',
      'atlantic beach', 'neptune beach', 'ponte vedra beach', 'sawgrass', 'st johns', 'clay', 'duval',
      'nassau', 'baker', 'union', 'bradford', 'alachua', 'gilchrist', 'levy', 'dixie', 'lafayette',
      'suwannee', 'columbia', 'hamilton', 'madison', 'taylor', 'lafayette', 'wakulla', 'jefferson',
      'gadsden', 'liberty', 'franklin', 'walton', 'okaloosa', 'santa rosa', 'escambia', 'holmes',
      'washington', 'bay', 'jackson', 'calhoun', 'gulf', 'citrus', 'hernando', 'pasco', 'pinellas',
      'hillsborough', 'manatee', 'sarasota', 'charlotte', 'lee', 'hendry', 'glades', 'ooltowaha',
      'brevard', 'volusia', 'flagler', 'putnam', 'st johns', 'clay', 'duval', 'nassau', 'baker',
      'union', 'bradford', 'alachua', 'gilchrist', 'levy', 'dixie', 'lafayette', 'suwannee', 'columbia',
      'hamilton', 'madison', 'taylor', 'lafayette', 'wakulla', 'jefferson', 'gadsden', 'liberty',
      'franklin', 'walton', 'okaloosa', 'santa rosa', 'escambia', 'holmes', 'washington', 'bay',
      'jackson', 'calhoun', 'gulf', 'citrus', 'hernando', 'pasco', 'pinellas', 'hillsborough', 'manatee',
      'sarasota', 'charlotte', 'lee', 'hendry', 'glades', 'ooltowaha', 'brevard', 'volusia', 'flagler',
      'putnam', 'st johns', 'clay', 'duval', 'nassau', 'baker', 'union', 'bradford', 'alachua', 'gilchrist',
      'levy', 'dixie', 'lafayette', 'suwannee', 'columbia', 'hamilton', 'madison', 'taylor', 'lafayette',
      'wakulla', 'jefferson', 'gadsden', 'liberty', 'franklin', 'walton', 'okaloosa', 'santa rosa',
      'escambia', 'holmes', 'washington', 'bay', 'jackson', 'calhoun', 'gulf', 'citrus', 'hernando',
      'pasco', 'pinellas', 'hillsborough', 'manatee', 'sarasota', 'charlotte', 'lee', 'hendry', 'glades',
      'ooltowaha', 'brevard', 'volusia', 'flagler', 'putnam'
    ];

    const parsed = {
      locationTerms: [] as string[],
      propertyTypeTerms: [] as string[],
      generalTerms: [] as string[]
    };

    for (let i = 0; i < terms.length; i++) {
      const term = terms[i];
      const normalizedTerm = normalizedTerms[i];

      // Check if it's a property type
      if (propertyTypes.includes(normalizedTerm)) {
        parsed.propertyTypeTerms.push(normalizedTerm);
      }
      // Check if it's a state name or abbreviation
      else if (stateNames.includes(normalizedTerm) || stateAbbreviations.includes(term.toUpperCase())) {
        parsed.locationTerms.push(normalizedTerm);
      }
      // Check if it's a common city
      else if (commonCities.some(city => normalizeSearchTerm(city).includes(normalizedTerm) || normalizedTerm.includes(normalizeSearchTerm(city)))) {
        parsed.locationTerms.push(normalizedTerm);
      }
      // Otherwise it's a general term
      else {
        parsed.generalTerms.push(term);
      }
    }

    return parsed;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const posts = await postsService.fetchPosts();
        setPosts(posts);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error fetching posts';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);
      const posts = await postsService.fetchPosts();
      setPosts(posts);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error fetching posts';
      setError(message);
    } finally {
      setLoading(false);
    }
  };



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
        status: formData.status,
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
  
  // Modal handlers
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setDetailModalOpen(true);
  };
  
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedPost(null);
  };
  
  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
    // Also update the selected post if it's the one being viewed in the modal
    setSelectedPost(prev => 
      prev && prev.id === updatedPost.id ? updatedPost : prev
    );
  };
  
  // derive filtered posts from local state
  const filteredPosts = posts.filter((post) => {
    const typeMatch =
      filterType === 'ALL' ? true : post.type === filterType;

    // Price filter
    let priceMatch = true;
    if (filterPrice !== 'ALL' && post.propertyDetails?.price) {
      const price = post.propertyDetails.price;
      switch (filterPrice) {
        case 'UNDER_100K':
          priceMatch = price < 100000;
          break;
        case '100K_500K':
          priceMatch = price >= 100000 && price < 500000;
          break;
        case '500K_1M':
          priceMatch = price >= 500000 && price < 1000000;
          break;
        case '1M_5M':
          priceMatch = price >= 1000000 && price < 5000000;
          break;
        case '5M_10M':
          priceMatch = price >= 5000000 && price < 10000000;
          break;
        case 'OVER_10M':
          priceMatch = price >= 10000000;
          break;
        default:
          priceMatch = true;
      }
    }

    // Size filter
    let sizeMatch = true;
    if (filterSize !== 'ALL') {
      const size = getSizeInSqft(post.propertyDetails);
      if (size === null) {
        sizeMatch = false;
      } else {
      switch (filterSize) {
        case 'UNDER_1000':
          sizeMatch = size < 1000;
          break;
        case '1000_5000':
          sizeMatch = size >= 1000 && size < 5000;
          break;
        case '5000_10000':
          sizeMatch = size >= 5000 && size < 10000;
          break;
        case '10000_50000':
          sizeMatch = size >= 10000 && size < 50000;
          break;
        case '50000_100000':
          sizeMatch = size >= 50000 && size < 100000;
          break;
        case 'OVER_100000':
          sizeMatch = size >= 100000;
          break;
        default:
          sizeMatch = true;
      }
      }
    }

    if (searchQuery.length < 3) {
      return typeMatch && priceMatch && sizeMatch;
    }

    // Parse smart search terms
    const parsedSearch = parseSmartSearch(searchQuery);
    const searchLower = searchQuery.toLowerCase();
    const normalizedSearch = normalizeSearchTerm(searchQuery);

    // Apply smart filters based on parsed terms
    let smartLocationMatch = true;
    let smartPropertyTypeMatch = true;
    let generalTextMatch = true;

    // Location filtering - check if any location terms match the property location
    if (parsedSearch.locationTerms.length > 0 && post.propertyDetails?.location) {
      smartLocationMatch = parsedSearch.locationTerms.some(locationTerm => {
        const cityMatch = post.propertyDetails!.location!.city &&
          normalizeSearchTerm(post.propertyDetails!.location!.city).includes(locationTerm);
        const stateMatch = post.propertyDetails!.location!.state &&
          normalizeSearchTerm(post.propertyDetails!.location!.state).includes(locationTerm);
        const addressMatch = post.propertyDetails!.location!.address &&
          post.propertyDetails!.location!.address.toLowerCase().includes(locationTerm);
        return cityMatch || stateMatch || addressMatch;
      });
    }

    // Property type filtering - check if any property type terms match
    if (parsedSearch.propertyTypeTerms.length > 0 && post.propertyDetails?.propertyType) {
      smartPropertyTypeMatch = parsedSearch.propertyTypeTerms.some(propertyTypeTerm =>
        normalizeSearchTerm(post.propertyDetails!.propertyType!).includes(propertyTypeTerm)
      );
    }

    // General text search for remaining terms
    if (parsedSearch.generalTerms.length > 0) {
      generalTextMatch = parsedSearch.generalTerms.some(generalTerm => {
        // Search in content
        const contentMatch = post.content?.toLowerCase().includes(generalTerm);
        // Search in username
        const userNameMatch = post.userName?.toLowerCase().includes(generalTerm);
        // Search in tags
        const tagsMatch = post.tags?.some(tag =>
          tag.replace(/\s+/g, '').toLowerCase().includes(generalTerm)
        );
        // Search in industry
        const industryMatch = post.propertyDetails?.industry?.some(industry =>
          industry.toLowerCase().includes(generalTerm)
        );

        return contentMatch || userNameMatch || tagsMatch || industryMatch;
      });
    }

    // Fallback to original search if no smart parsing was applied
    if (parsedSearch.locationTerms.length === 0 && parsedSearch.propertyTypeTerms.length === 0 && parsedSearch.generalTerms.length === 0) {
      // Search in content
      const contentMatch = post.content?.toLowerCase().includes(searchLower) || false;
      // Search in username
      const userNameMatch = post.userName?.toLowerCase().includes(searchLower) || false;
      // Search in tags
      const tagsMatch = post.tags?.some(tag =>
        tag.replace(/\s+/g, '').toLowerCase().includes(searchLower)
      ) || false;
      // Search in property details
      const propertyTypeMatch = post.propertyDetails?.propertyType?.toLowerCase().includes(searchLower) || false;
      const industryMatch = post.propertyDetails?.industry?.some(industry =>
        industry.toLowerCase().includes(searchLower)
      ) || false;
      const locationMatch = post.propertyDetails?.location &&
        ((post.propertyDetails.location.city && normalizeSearchTerm(post.propertyDetails.location.city).includes(normalizedSearch)) ||
         (post.propertyDetails.location.state?.toLowerCase().includes(searchLower)) ||
         (post.propertyDetails.location.address?.toLowerCase().includes(searchLower))) || false;

      generalTextMatch = contentMatch || userNameMatch || tagsMatch ||
                       propertyTypeMatch || industryMatch || locationMatch;
    }

    return typeMatch && priceMatch && sizeMatch && smartLocationMatch && smartPropertyTypeMatch && generalTextMatch;
  });

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <NavigationBar />
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: { xs: 3, md: 4 },
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <NavigationBar />
      <Box component="main" sx={{ flex: 1, py: { xs: 3, md: 4 } }}>
        {error ? (
          <Container maxWidth="md">
            <ErrorDisplay error={error} onRetry={handleRetry} loading={loading} />
          </Container>
        ) : (
          <>
            <Container
              maxWidth="xl"
              sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
            >
              <SearchAndFilterBar
                searchQuery={searchQuery}
                filterType={filterType}
                filterPrice={filterPrice}
                filterSize={filterSize}
                onSearchChange={setSearchQuery}
                onFilterChange={setFilterType}
                onPriceFilterChange={setFilterPrice}
                onSizeFilterChange={setFilterSize}
                onClearSearch={() => setSearchQuery('')}
                onClearAllFilters={() => {
                  setSearchQuery('');
                  setFilterType('ALL');
                  setFilterPrice('ALL');
                  setFilterSize('ALL');
                }}
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <Card 
                      key={post.id} 
                      elevation={2} 
                      onClick={() => handlePostClick(post)}
                      sx={{ 
                        borderRadius: 3, 
                        position: 'relative', 
                        overflow: 'hidden', 
                        maxHeight: 300, 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, elevation 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          elevation: 4,
                        }
                      }}
                    >
                  {/* Conditional Image Section - Only for HAVE posts */}
                  {post.type === 'HAVE' && (
                    <Box sx={{ position: 'relative', height: '70%', flexShrink: 0 }}>
                      {post.imageUrl ? (
                        <CardMedia
                          component="img"
                          image={post.imageUrl}
                          alt="Post image"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <CardMedia
                          component="img"
                          image="/no-image.png"
                          alt="No image available"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: 0.7,
                          }}
                        />
                      )}

                      {/* Overlay Content on Image */}
                      <Box
                        sx={(theme) => ({
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(to bottom, ${alpha(theme.palette.common.black, 0.1)} 0%, ${alpha(theme.palette.common.black, 0.72)} 100%)`,
                          color: theme.palette.common.white,
                          p: 2,
                          display: 'flex',
                          flexDirection: 'column',
                        })}
                      >
                      {/* Top Section - Profile Info and Deal Type */}
                      <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}>
                        <Avatar 
                          src={post.userAvatarUrl}
                          sx={{
                            bgcolor: "rgba(255,255,255,0.2)",
                            width: 32,
                            height: 32,
                            cursor: post.userId ? 'pointer' : 'default',
                            '&:hover': post.userId ? {
                              bgcolor: "rgba(255,255,255,0.3)",
                            } : {}
                          }}
                          onClick={() => post.userId && navigate(`/profile/${post.userId}`)}
                        >
                          {!post.userAvatarUrl && <PersonIcon sx={{ fontSize: 16 }} />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          {post.userEmail ? (
                            <Link
                              href={`mailto:${post.userEmail}?subject=Re: ${encodeURIComponent(post.content.substring(0, 50))}${post.content.length > 50 ? '...' : ''}`}
                              underline="hover"
                              variant="subtitle2"
                              sx={{
                                color: 'inherit',
                                fontWeight: 600,
                              }}
                            >
                              {post.userName}
                            </Link>
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{
                                color: 'inherit',
                                fontWeight: 600,
                              }}
                            >
                              {post.userName}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            icon={getTypeIcon(post.type)}
                            label={post.type}
                            color={getTypeColor(post.type)}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 24,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                          <Chip
                            label={post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Active'}
                            size="small"
                            sx={(theme) => ({
                              fontSize: '0.7rem',
                              height: 24,
                              backgroundColor: 'rgba(255, 255, 255, 0.9)',
                              color: theme.palette.text.primary,
                              border: `1px solid rgba(255, 255, 255, 0.3)`,
                              '& .MuiChip-label': { px: 1, fontWeight: 500 }
                            })}
                          />
                        </Box>
                      </Box>

                      {/* Property Type, Industry, and Location - Right below profile */}
                      {post.propertyDetails && (
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          mb: 'auto',
                        }}>
                          {post.propertyDetails.propertyType && (
                            <Chip
                              icon={<span style={{ fontSize: '0.75rem' }}>🏢</span>}
                              label={post.propertyDetails.propertyType}
                              size="small"
                              variant="outlined"
                              sx={(theme) => ({
                                height: 24,
                                borderColor: alpha(theme.palette.common.white, 0.4),
                                color: theme.palette.common.white,
                                backgroundColor: alpha(theme.palette.common.white, 0.12),
                                '& .MuiChip-label': {
                                  ...theme.typography.caption,
                                  px: 1,
                                },
                              })}
                            />
                          )}
                          {post.propertyDetails.industry && post.propertyDetails.industry.length > 0 && (
                            <Chip
                              icon={<span style={{ fontSize: '0.75rem' }}>💼</span>}
                              label={post.propertyDetails.industry.slice(0, 2).join(', ')}
                              size="small"
                              variant="outlined"
                              sx={(theme) => ({
                                height: 24,
                                borderColor: alpha(theme.palette.common.white, 0.4),
                                color: theme.palette.common.white,
                                backgroundColor: alpha(theme.palette.common.white, 0.12),
                                '& .MuiChip-label': {
                                  ...theme.typography.caption,
                                  px: 1,
                                },
                              })}
                            />
                          )}
                          {post.propertyDetails.location && (
                            <Chip
                              icon={<span style={{ fontSize: '0.75rem' }}>📍</span>}
                              label={`${post.propertyDetails.location.city}, ${post.propertyDetails.location.state}`}
                              size="small"
                              variant="outlined"
                              sx={(theme) => ({
                                height: 24,
                                borderColor: alpha(theme.palette.common.white, 0.4),
                                color: theme.palette.common.white,
                                backgroundColor: alpha(theme.palette.common.white, 0.12),
                                '& .MuiChip-label': {
                                  ...theme.typography.caption,
                                  px: 1,
                                },
                              })}
                            />
                          )}
                        </Box>
                      )}
                      </Box>
                    </Box>
                  )}

                  {/* Header Section for NEED posts - No image, just profile info */}
                  {post.type === 'NEED' && (
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                      <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}>
                        <Avatar 
                          src={post.userAvatarUrl}
                          sx={{
                            width: 32,
                            height: 32,
                            cursor: post.userId ? 'pointer' : 'default',
                          }}
                          onClick={() => post.userId && navigate(`/profile/${post.userId}`)}
                        >
                          {!post.userAvatarUrl && <PersonIcon sx={{ fontSize: 16 }} />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          {post.userEmail ? (
                            <Link
                              href={`mailto:${post.userEmail}?subject=Re: ${encodeURIComponent(post.content.substring(0, 50))}${post.content.length > 50 ? '...' : ''}`}
                              underline="hover"
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                              }}
                            >
                              {post.userName}
                            </Link>
                          ) : (
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                              }}
                            >
                              {post.userName}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip
                            icon={getTypeIcon(post.type)}
                            label={post.type}
                            color={getTypeColor(post.type)}
                            size="small"
                            sx={{
                              fontSize: '0.7rem',
                              height: 24,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                          <Chip
                            label={post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Active'}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: '0.7rem',
                              height: 24,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Property Type, Industry, and Location for NEED posts */}
                      {post.propertyDetails && (
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}>
                          {post.propertyDetails.propertyType && (
                            <Chip
                              icon={<span style={{ fontSize: '0.75rem' }}>🏢</span>}
                              label={post.propertyDetails.propertyType}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 24,
                              }}
                            />
                          )}
                          {post.propertyDetails.industry && post.propertyDetails.industry.length > 0 && (
                            <Chip
                              icon={<span style={{ fontSize: '0.75rem' }}>💼</span>}
                              label={post.propertyDetails.industry.slice(0, 2).join(', ')}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 24,
                              }}
                            />
                          )}
                          {post.propertyDetails.location && (
                            <Chip
                              icon={<span style={{ fontSize: '0.75rem' }}>📍</span>}
                              label={`${post.propertyDetails.location.city}, ${post.propertyDetails.location.state}`}
                              size="small"
                              variant="outlined"
                              sx={{
                                height: 24,
                              }}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Details Section - Adjusted height based on post type */}
                  <CardContent sx={{ 
                    height: post.type === 'HAVE' ? '30%' : 'auto', 
                    flex: post.type === 'NEED' ? 1 : undefined,
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: 1 
                  }}>
                    {/* Description */}
                    <Tooltip title={post.content} placement="top">
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontWeight: 500,
                        }}
                      >
                        {post.content}
                      </Typography>
                    </Tooltip>

                    {/* Size, Price, and Tags */}
                    <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Size and Price */}
                      {post.propertyDetails && (
                        <Box sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}>
                          {post.propertyDetails.size && (
                            <Chip
                              icon={<span style={{ fontSize: '0.7rem' }}>📐</span>}
                              label={`${post.propertyDetails.size.toLocaleString()} ${post.propertyDetails.sizeUnit}`}
                              size="small"
                              variant="outlined"
                              sx={(theme) => ({
                                height: 28,
                                borderColor: theme.palette.success.main,
                                color: theme.palette.success.main,
                                '& .MuiChip-label': {
                                  ...theme.typography.caption,
                                  px: 1,
                                },
                              })}
                            />
                          )}
                          {post.propertyDetails.price && (
                            <Chip
                              icon={<span style={{ fontSize: '0.7rem' }}>💰</span>}
                              label={`$${post.propertyDetails.price.toLocaleString()}`}
                              size="small"
                              variant="outlined"
                              sx={(theme) => ({
                                height: 28,
                                borderColor: theme.palette.warning.main,
                                color: theme.palette.warning.main,
                                '& .MuiChip-label': {
                                  ...theme.typography.caption,
                                  px: 1,
                                },
                              })}
                            />
                          )}
                        </Box>
                      )}

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {post.tags.slice(0, 4).map((tag, index) => (
                            <Chip
                              key={index}
                              label={`#${tag}`}
                              size="small"
                              sx={(theme) => ({
                                height: 24,
                                bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[300],
                                color: isDark ? theme.palette.grey[100] : theme.palette.grey[800],
                                '& .MuiChip-label': {
                                  ...theme.typography.caption,
                                  px: 0.75,
                                },
                              })}
                            />
                          ))}
                          {post.tags.length > 4 && (
                            <Chip
                              label={`+${post.tags.length - 4}`}
                              size="small"
                              sx={(theme) => ({
                                height: 24,
                                bgcolor: isDark ? theme.palette.grey[700] : theme.palette.grey[300],
                                color: isDark ? theme.palette.grey[100] : theme.palette.grey[800],
                                '& .MuiChip-label': {
                                  ...theme.typography.caption,
                                  px: 0.75,
                                },
                              })}
                            />
                          )}
                        </Box>
                      )}
                    </Box>
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
                  minHeight: 150,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  No results found. Try adjusting your search or filters.
                </Typography>
              </Box>
            )}
          </Box>
          </Container>

          {/* Floating Action Button */}
          <Fab
            color="primary"
            onClick={handleOpenPopover}
            aria-label="Create property deal"
            variant={isLargeScreen ? 'extended' : 'circular'}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1000,
              ...(isLargeScreen && { gap: 1.5, px: 3 }),
            }}
            size="medium"
          >
            {isLargeScreen ? (
              <>
                <AddIcon sx={{ mr: 1 }} />
                Create Deal
              </>
            ) : (
              <AddIcon />
            )}
          </Fab>

          {/* Create Post Popover */}
          <Popover
            open={open}
            onClose={handleClosePopover}
            anchorReference="none"
            PaperProps={{
              sx: {
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
              },
            }}
            BackdropProps={{
              sx: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
            }}
          >
            <Paper sx={{ p: 2, position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexShrink: 0 }}>
                <Typography variant="h6">
                  Create Property Deal
                </Typography>
                <IconButton
                  onClick={handleClosePopover}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2, flexShrink: 0 }} />
              <Box sx={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                {submitError && <Alert severity="error" sx={{ mb: 2 }}>{submitError}</Alert>}
                <CreatePostForm
                  onSubmit={handleSubmit}
                  onCancel={handleClosePopover}
                  submitting={submitting}
                  submitError={submitError}
                  disabled={submitting}
                />
              </Box>
            </Paper>
          </Popover>
          
          {/* Post Detail Modal */}
          <PostDetailModal
            post={selectedPost}
            open={detailModalOpen}
            onClose={handleCloseDetailModal}
            onPostUpdated={handlePostUpdated}
          />
          </>
        )}
      </Box>
    </Box>
  );
};

export default FeedDisplay;
