import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  Avatar,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import { useAuth } from '../contexts/useAuth';
import { PhotoCamera } from '@mui/icons-material';

interface ProfileResponse {
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
  updatedAt: string;
}

interface ProfileFormState {
  username: string;
  email: string;
  avatarUrl: string;
  licenseNumber: string;
  company: string;
  phone: string;
  bio: string;
  specialties: string;
  isRealtor: boolean;
}

const initialFormState: ProfileFormState = {
  username: '',
  email: '',
  avatarUrl: '',
  licenseNumber: '',
  company: '',
  phone: '',
  bio: '',
  specialties: '',
  isRealtor: false,
};

const ProfileEditPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, token, logout, updateUser } = useAuth();

  const [formState, setFormState] = useState<ProfileFormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [avatarFileData, setAvatarFileData] = useState<string | null>(null);
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isOwnProfile = useMemo(() => {
    return user && userId ? user.id === userId : false;
  }, [user, userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('Invalid user ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiUrl = import.meta.env.PROD ? `/api/users/${userId}` : `http://localhost:3000/api/users/${userId}`;
        const response = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
        });

        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
          logout();
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to load profile (${response.status})`);
        }

        const data: ProfileResponse = await response.json();
        setFormState({
          username: data.username ?? '',
          email: data.email ?? '',
          avatarUrl: data.avatarUrl ?? '',
          licenseNumber: data.licenseNumber ?? '',
          company: data.company ?? '',
          phone: data.phone ?? '',
          bio: data.bio ?? '',
          specialties: data.specialties?.join(', ') ?? '',
          isRealtor: Boolean(data.isRealtor),
        });
        const avatar = data.avatarUrl ?? '';
        setAvatarPreview(avatar);
        setOriginalAvatarUrl(avatar);
        setAvatarFileData(null);
        setError(null);
      } catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown error fetching profile';
  setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [logout, token, userId]);

  useEffect(() => {
    if (!isOwnProfile && user && userId) {
      setError('You can only edit your own profile.');
    }
  }, [isOwnProfile, user, userId]);

  const handleFieldChange = (field: keyof ProfileFormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'isRealtor' ? (event.target as HTMLInputElement).checked : event.target.value;

    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarFileData(result);
      setAvatarPreview(result);
      setFormState((prev) => ({
        ...prev,
        avatarUrl: '',
      }));
    };
    reader.onerror = () => {
      setError('Unable to load selected image. Please try a different file.');
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAvatarRemove = () => {
    setAvatarFileData(null);
    setAvatarPreview('');
    setFormState((prev) => ({
      ...prev,
      avatarUrl: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarRevert = () => {
    setAvatarFileData(null);
    setAvatarPreview(originalAvatarUrl);
    setFormState((prev) => ({
      ...prev,
      avatarUrl: originalAvatarUrl,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: Record<string, unknown> = {
      username: formState.username.trim(),
      email: formState.email.trim(),
      isRealtor: formState.isRealtor,
    };

    const trimmedLicense = formState.licenseNumber.trim();
    if (trimmedLicense) {
      payload.licenseNumber = trimmedLicense;
    }

    const trimmedCompany = formState.company.trim();
    if (trimmedCompany) {
      payload.company = trimmedCompany;
    }

    const trimmedPhone = formState.phone.trim();
    if (trimmedPhone) {
      payload.phone = trimmedPhone;
    }

    const trimmedBio = formState.bio.trim();
    if (trimmedBio) {
      payload.bio = trimmedBio;
    }

    const specialtiesArray = formState.specialties
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    payload.specialties = specialtiesArray;

    if (avatarFileData) {
      payload.avatar = avatarFileData;
    } else {
      const trimmedAvatarUrl = formState.avatarUrl.trim();
      if (trimmedAvatarUrl) {
        payload.avatarUrl = trimmedAvatarUrl;
      } else if (originalAvatarUrl) {
        payload.avatarUrl = '';
      }
    }

    try {
      const apiUrl = import.meta.env.PROD ? `/api/users/${userId}` : `http://localhost:3000/api/users/${userId}`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setError('Your session has expired. Please log in again.');
        logout();
        return;
      }

      if (response.status === 403) {
        setError('You are not allowed to update this profile.');
        return;
      }

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to update profile');
      }

      const updatedProfile: ProfileResponse = await response.json();
      updateUser(updatedProfile);
      setFormState({
        username: updatedProfile.username ?? '',
        email: updatedProfile.email ?? '',
        avatarUrl: updatedProfile.avatarUrl ?? '',
        licenseNumber: updatedProfile.licenseNumber ?? '',
        company: updatedProfile.company ?? '',
        phone: updatedProfile.phone ?? '',
        bio: updatedProfile.bio ?? '',
        specialties: updatedProfile.specialties?.join(', ') ?? '',
        isRealtor: Boolean(updatedProfile.isRealtor),
      });
      const updatedAvatar = updatedProfile.avatarUrl ?? '';
      setAvatarPreview(updatedAvatar);
      setOriginalAvatarUrl(updatedAvatar);
      setAvatarFileData(null);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error updating profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!userId) {
    return (
      <>
        <NavigationBar />
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">Invalid user ID.</Alert>
        </Container>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <NavigationBar />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <NavigationBar />
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper component="form" onSubmit={handleSubmit} sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Edit Profile
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Update your account details so others can get to know you better.
            </Typography>
          </Box>

          {!isOwnProfile && (
            <Alert severity="warning">
              You are viewing another member's profile. Changes may be restricted.
            </Alert>
          )}

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarFileChange}
          />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Avatar
              src={avatarPreview || undefined}
              alt={formState.username || 'Profile avatar'}
              sx={{ width: 96, height: 96, fontSize: 32 }}
            >
              {formState.username?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                Profile photo
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This image appears on your profile and deal cards.
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  onClick={handleAvatarButtonClick}
                  disabled={saving}
                >
                  Change Photo
                </Button>
                {(avatarFileData || (originalAvatarUrl && avatarPreview && avatarPreview !== originalAvatarUrl)) && (
                  <Button
                    variant="text"
                    color="secondary"
                    onClick={handleAvatarRevert}
                    disabled={saving}
                  >
                    Revert to Original
                  </Button>
                )}
                {(avatarPreview || avatarFileData) && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleAvatarRemove}
                    disabled={saving}
                  >
                    Remove Photo
                  </Button>
                )}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Recommended size 200×200px (JPG, PNG, GIF).
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              label="Username"
              value={formState.username}
              onChange={handleFieldChange('username')}
              fullWidth
              required
              sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}
            />
            <TextField
              label="Email"
              type="email"
              value={formState.email}
              onChange={handleFieldChange('email')}
              fullWidth
              required
              sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}
            />

            <TextField
              label="Company"
              value={formState.company}
              onChange={handleFieldChange('company')}
              fullWidth
              sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}
            />
            <TextField
              label="Phone"
              value={formState.phone}
              onChange={handleFieldChange('phone')}
              fullWidth
              sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}
            />

            <TextField
              label="License Number"
              value={formState.licenseNumber}
              onChange={handleFieldChange('licenseNumber')}
              fullWidth
              sx={{ gridColumn: { xs: '1 / -1', sm: 'span 1' } }}
            />
            <TextField
              label="Specialties"
              value={formState.specialties}
              onChange={handleFieldChange('specialties')}
              fullWidth
              helperText="Separate specialties with commas."
              sx={{ gridColumn: '1 / -1' }}
            />

            <TextField
              label="Bio"
              value={formState.bio}
              onChange={handleFieldChange('bio')}
              fullWidth
              multiline
              minRows={3}
              sx={{ gridColumn: '1 / -1' }}
            />

            <Box sx={{ gridColumn: '1 / -1' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formState.isRealtor}
                    onChange={handleFieldChange('isRealtor')}
                    color="primary"
                  />
                }
                label="I'm a licensed realtor"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="text"
                color="secondary"
                onClick={() => navigate(`/profile/${userId}`)}
                disabled={saving}
              >
                View Profile
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ProfileEditPage;
