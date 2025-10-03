import React, { useEffect, useMemo, useState } from 'react';
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
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import { useAuth } from '../contexts/AuthContext';

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload: Record<string, unknown> = {
      username: formState.username.trim(),
      email: formState.email.trim(),
      avatarUrl: formState.avatarUrl.trim(),
      licenseNumber: formState.licenseNumber.trim(),
      company: formState.company.trim(),
      phone: formState.phone.trim(),
      bio: formState.bio.trim(),
      isRealtor: formState.isRealtor,
    };

    const specialtiesArray = formState.specialties
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    payload.specialties = specialtiesArray;

    // Remove empty strings to avoid overwriting with blanks unintentionally
    Object.keys(payload).forEach((key) => {
      const value = payload[key];
      if (typeof value === 'string' && value.length === 0) {
        delete payload[key];
      }
    });

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
              label="Avatar URL"
              value={formState.avatarUrl}
              onChange={handleFieldChange('avatarUrl')}
              fullWidth
              helperText="Paste a link to an image to use as your avatar."
              sx={{ gridColumn: '1 / -1' }}
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
