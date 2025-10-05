import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AppThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/useTheme';

import './App.css';
import FeedDisplay from './components/FeedDisplay';
import ProfilePage from './components/ProfilePage';
import ProfileEditPage from './components/ProfileEditPage';

// Theme wrapper component that uses the theme context
const ThemedApp: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/profile/:userId" element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } />
            <Route path="/profile/:userId/edit" element={
              <PrivateRoute>
                <ProfileEditPage />
              </PrivateRoute>
            } />
            <Route path="/*" element={
              <PrivateRoute>
                <FeedDisplay  />
              </PrivateRoute>
            } />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

function App() {
  return (
    <AppThemeProvider>
      <ThemedApp />
    </AppThemeProvider>
  );
}

export default App;
