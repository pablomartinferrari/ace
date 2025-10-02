
import { ThemeProvider } from '@mui/material/styles';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import { AppThemeProvider, useTheme } from './contexts/ThemeContext';

import './App.css';
import FeedDisplay from './components/FeedDisplay';

// Theme wrapper component that uses the theme context
const ThemedApp: React.FC = () => {
  const { theme } = useTheme();

  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<AuthPage />} />
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
