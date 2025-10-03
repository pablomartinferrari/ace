import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Button,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Badge as BadgeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  licenseNumber?: string;
  company?: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  isRealtor?: boolean;
  createdAt: string;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        console.error('No userId provided in URL params');
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      // Validate that userId looks like a MongoDB ObjectId (24 hex characters)
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(userId)) {
        console.error('Invalid userId format:', userId);
        setError('Invalid user ID format');
        setLoading(false);
        return;
      }

      console.log('ProfilePage: userId from params:', userId);

      try {
        setLoading(true);
        const apiUrl = import.meta.env.PROD ? `/api/users/${userId}` : `http://localhost:3000/api/users/${userId}`;
        console.log('Fetching profile from:', apiUrl, 'for userId:', userId);

        const response = await fetch(apiUrl);
        console.log('Response status:', response.status, 'ok:', response.ok);

        if (!response.ok && response.status !== 304) {
          throw new Error(`Failed to fetch profile: ${response.status} ${response.statusText}`);
        }

        // For 304 responses, we might not have a body, so handle that case
        if (response.status === 304) {
          console.log('Profile data unchanged (304 response)');
          // If we have cached data, we could use it here, but for now just show an error
          throw new Error('Profile data not available');
        }

        const profileData = await response.json();
        console.log('Profile data received:', profileData);
        setProfile(profileData);
      } catch (err) {
        console.error('Profile fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load profile: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleEmailInquiry = (subject: string) => {
    const emailSubject = encodeURIComponent(subject);
    const emailBody = encodeURIComponent(
      `Hi ${profile?.username},\n\nI'm interested in learning more about your property listings. Could you please provide me with additional details?\n\nBest regards,`
    );
    window.open(`mailto:${profile?.email}?subject=${emailSubject}&body=${emailBody}`);
  };

  const handlePhoneCall = () => {
    if (profile?.phone) {
      window.open(`tel:${profile.phone}`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <Alert severity="error">
            {error || 'Profile not found'}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Typography variant="h4" component="h1" gutterBottom align="center">
          Realtor Profile
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Profile Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            src={profile.avatarUrl}
            sx={{ width: 120, height: 120, mr: 3 }}
          >
            {profile.username.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h2" gutterBottom>
              {profile.username}
            </Typography>

            {profile.isRealtor && profile.company && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="h6" color="text.secondary">
                  {profile.company}
                </Typography>
              </Box>
            )}

            {profile.isRealtor && profile.licenseNumber && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BadgeIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1" color="text.secondary">
                  License: {profile.licenseNumber}
                </Typography>
              </Box>
            )}

            {/* Contact Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                onClick={() => handleEmailInquiry('Property Inquiry')}
                sx={{ flex: 1, minWidth: 150 }}
              >
                Email Inquiry
              </Button>

              {profile.phone && (
                <Button
                  variant="outlined"
                  startIcon={<PhoneIcon />}
                  onClick={handlePhoneCall}
                  sx={{ flex: 1, minWidth: 150 }}
                >
                  Call {profile.phone}
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Bio Section */}
        {profile.bio && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              {profile.bio}
            </Typography>
          </Box>
        )}

        {/* Specialties Section */}
        {profile.specialties && profile.specialties.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Specialties
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {profile.specialties.map((specialty) => (
                <Chip
                  key={specialty}
                  label={specialty}
                  variant="outlined"
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText',
                    borderColor: 'primary.main',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Contact Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <Link
                href={`mailto:${profile.email}`}
                sx={{ textDecoration: 'none', color: 'primary.main' }}
              >
                {profile.email}
              </Link>
            </Box>

            {profile.phone && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Link
                  href={`tel:${profile.phone}`}
                  sx={{ textDecoration: 'none', color: 'primary.main' }}
                >
                  {profile.phone}
                </Link>
              </Box>
            )}
          </Box>
        </Box>

        {/* Member Since */}
        <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="body2" color="text.secondary">
            Member since {new Date(profile.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;