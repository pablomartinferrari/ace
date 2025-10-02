// LoginForm.tsx
// React + TypeScript component for user login
// Features:
// 1. Form with email, password fields
// 2. Form validation and error handling
// 3. Submits to /api/auth/login
// 4. Stores JWT token and user data in localStorage on success
// 5. Material-UI components for consistent styling

import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Link
} from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister
}) => {
  // Form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // Get auth functions from context
  const { login } = useAuth();

  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form validation
  const validateForm = (): boolean => {
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
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Make sure this prevents default form submission

    // Clear any previous errors
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Use AuthContext login function
      await login(email.toLowerCase().trim(), password);

      // Clear form
      setEmail('');
      setPassword('');

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      // Force state update
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          Welcome Back
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Sign in to your ACE account
        </Typography>

        {error && (
          <Alert 
            key={`error-${Date.now()}`} // Unique key to force re-render
            severity="error" 
            sx={{ 
              mb: 3, 
              mt: 2,
              '& .MuiAlert-message': {
                fontWeight: 'bold'
              }
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
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
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={submitting ? <CircularProgress size={20} /> : <LoginIcon />}
            disabled={submitting}
            sx={{ mt: 3, mb: 2 }}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </Box>

        {onSwitchToRegister && (
          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don't have an account?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={onSwitchToRegister}
              sx={{ cursor: 'pointer' }}
            >
              Create one here
            </Link>
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default LoginForm;