import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  ButtonBase,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navigateTo = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
    handleMenuClose();
  };

  const handleEditProfile = () => {
    if (!user) return;
    navigateTo(`/profile/${user.id}/edit`);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleLogin = () => {
    navigate('/login');
    handleMenuClose();
  };

  const handleNavigateHome = () => {
    if (location.pathname !== '/') {
      navigate('/');
    }
    handleMenuClose();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="default"
      sx={(theme) => ({
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Toolbar sx={{ gap: 1.5 }}>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="open navigation menu"
          onClick={handleMenuOpen}
        >
          <MenuIcon />
        </IconButton>
        <ButtonBase
          onClick={handleNavigateHome}
          aria-label="Go to home"
          sx={{
            borderRadius: 1,
            p: 0.75,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Box
            component="img"
            src="/ace.svg"
            alt="ACE Logo"
            sx={{
              height: '3rem',
              width: 'auto',
            }}
          />
        </ButtonBase>
        <Box sx={{ ml: 1, flexGrow: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ letterSpacing: '0.08em' }}
          >
            ACE DEALS
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">
            Real Estate Network
          </Typography>
        </Box>

        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}
            >
              {user.username}
            </Typography>
            <Avatar
              src={user.avatarUrl}
              alt={user.username}
              sx={{ width: 36, height: 36 }}
            >
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
          </Box>
        )}

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        >
          {user ? (
            <>
              <MenuItem onClick={handleEditProfile}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Edit Profile" />
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </>
          ) : (
            <MenuItem onClick={handleLogin}>
              <ListItemText primary="Login" />
            </MenuItem>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
