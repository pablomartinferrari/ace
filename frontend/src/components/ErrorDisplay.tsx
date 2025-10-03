import React from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';

interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
  loading?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  loading = false
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        px: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <ErrorIcon
            sx={{
              fontSize: 64,
              color: 'error.main',
              opacity: 0.7,
            }}
          />

          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Oops! Something went wrong
          </Typography>

          <Alert
            severity="error"
            sx={{
              width: '100%',
              textAlign: 'left',
              '& .MuiAlert-message': {
                width: '100%',
              },
            }}
          >
            <Typography variant="body2">
              {error}
            </Typography>
          </Alert>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Don't worry, this happens sometimes. Try refreshing to load the posts again.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={onRetry}
            disabled={loading}
            startIcon={<RefreshIcon />}
            sx={{
              minWidth: 140,
              py: 1,
            }}
          >
            {loading ? 'Retrying...' : 'Try Again'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ErrorDisplay;