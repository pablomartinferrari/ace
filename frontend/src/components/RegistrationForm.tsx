// RegistrationForm.tsx
// React + TypeScript component for user registration
// Features:
// 1. Form with name, email, password fields
// 2. Form validation and error handling
// 3. Submits to /api/auth/register
// 4. Stores JWT token and user data in localStorage on success
// 5. Material-UI components for consistent styling

import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Link,
  Avatar,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { PersonAdd as RegisterIcon, PhotoCamera, Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

interface RegistrationFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  onSwitchToLogin
}) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Realtor fields
  const [isRealtor, setIsRealtor] = useState<boolean>(false);
  const [licenseNumber, setLicenseNumber] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [currentSpecialty, setCurrentSpecialty] = useState<string>('');

  const navigate = useNavigate();
  const { register } = useAuth();

  // Avatar handling
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
    setAvatarPreview('');
  };

  // Specialty handling
  const handleAddSpecialty = () => {
    if (currentSpecialty.trim() && !specialties.includes(currentSpecialty.trim())) {
      setSpecialties([...specialties, currentSpecialty.trim()]);
      setCurrentSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setSpecialties(specialties.filter(s => s !== specialty));
  };

  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Form validation
  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Realtor validation
    if (isRealtor) {
      if (!licenseNumber.trim()) {
        setError('License number is required for realtors');
        return false;
      }
      if (!company.trim()) {
        setError('Company name is required for realtors');
        return false;
      }
      if (!phone.trim()) {
        setError('Phone number is required for realtors');
        return false;
      }
      if (!bio.trim()) {
        setError('Bio is required for realtors');
        return false;
      }
      if (specialties.length === 0) {
        setError('At least one specialty is required for realtors');
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      const registerData = {
        username: name.trim(),
        email: email.toLowerCase().trim(),
        password,
        avatar: avatar || undefined,
        licenseNumber: isRealtor ? licenseNumber.trim() : undefined,
        company: isRealtor ? company.trim() : undefined,
        phone: isRealtor ? phone.trim() : undefined,
        bio: isRealtor ? bio.trim() : undefined,
        specialties: isRealtor ? specialties : undefined,
        isRealtor,
      };

      await register(registerData);

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAvatar(null);
      setAvatarPreview('');
      setLicenseNumber('');
      setCompany('');
      setPhone('');
      setBio('');
      setSpecialties([]);
      setIsRealtor(false);

      if (onSuccess) onSuccess();
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', bgcolor: 'background.default' }}>
      <Paper
        elevation={3}
        square
        sx={{
          minHeight: '100vh',
          width: '100vw',
          borderRadius: 0,
          p: { xs: 2, sm: 4 },
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ flex: 1, overflowY: 'auto', width: '100%', maxWidth: 720, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box textAlign="center">
            <Typography variant="h4" component="h1" color="primary" gutterBottom>
              Join ACE Community
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your account to start sharing
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} pb={4} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Profile Picture Section - Compact Layout */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={avatarPreview}
                sx={{ width: 60, height: 60 }}
              >
                {!avatarPreview && <RegisterIcon sx={{ fontSize: 24 }} />}
              </Avatar>
              {avatarPreview && (
                <IconButton
                  onClick={handleRemoveAvatar}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'error.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'error.dark' },
                    width: 20,
                    height: 20,
                  }}
                  size="small"
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Profile Picture (Optional)
              </Typography>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCamera />}
                  disabled={submitting}
                  size="small"
                >
                  Upload Photo
                </Button>
              </label>
            </Box>
          </Box>

          {/* Basic Information */}
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>

          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            variant="outlined"
            margin="normal"
            required
            disabled={submitting}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            margin="normal"
            required
            disabled={submitting}
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            required
            disabled={submitting}
            helperText="Must be at least 6 characters"
            sx={{ mb: 1 }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            variant="outlined"
            margin="normal"
            required
            disabled={submitting}
            helperText="Re-enter your password"
            sx={{ mb: 1 }}
          />

          <Divider sx={{ my: 3 }} />

          {/* Realtor Section */}
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isRealtor}
                  onChange={(e) => setIsRealtor(e.target.checked)}
                  disabled={submitting}
                />
              }
              label="I am a realtor"
            />
          </Box>

          {isRealtor && (
            <>
              <Typography variant="h6" gutterBottom>
                Realtor Information
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    sx={{ flex: 1, minWidth: 200 }}
                    label="License Number"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    variant="outlined"
                    margin="dense"
                    required
                    disabled={submitting}
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: 200 }}
                    label="Company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    variant="outlined"
                    margin="dense"
                    required
                    disabled={submitting}
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    sx={{ flex: 1, minWidth: 200 }}
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    variant="outlined"
                    margin="dense"
                    required
                    disabled={submitting}
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: 200 }}
                    label="Bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    variant="outlined"
                    margin="dense"
                    required
                    multiline
                    rows={2}
                    disabled={submitting}
                    helperText="Tell clients about yourself"
                  />
                </Box>
              </Box>

              {/* Specialties */}
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Specialties
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label="Add Specialty"
                    value={currentSpecialty}
                    onChange={(e) => setCurrentSpecialty(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialty())}
                    variant="outlined"
                    size="small"
                    disabled={submitting}
                  />
                  <Button
                    variant="outlined"
                    onClick={handleAddSpecialty}
                    disabled={submitting || !currentSpecialty.trim()}
                    size="small"
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {specialties.map((specialty) => (
                    <Chip
                      key={specialty}
                      label={specialty}
                      onDelete={() => handleRemoveSpecialty(specialty)}
                      size="small"
                      disabled={submitting}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={submitting ? <CircularProgress size={20} /> : <RegisterIcon />}
            disabled={submitting}
            sx={{ mt: 2, mb: 1 }}
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </Button>
        </Box>

        {onSwitchToLogin && (
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={onSwitchToLogin}
              sx={{ cursor: 'pointer' }}
            >
              Sign in here
            </Link>
          </Typography>
        )}
          </Box>
        </Paper>
      </Box>
  );
};

export default RegistrationForm;