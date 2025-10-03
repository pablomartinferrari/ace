import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  // Realtor-specific fields
  licenseNumber?: string;
  company?: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  isRealtor?: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  avatar?: File;
  licenseNumber?: string;
  company?: string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  isRealtor?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const apiUrl = import.meta.env.PROD ? '/api/auth/login' : 'http://localhost:3000/api/auth/login';
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Login failed');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    navigate('/');
  };

  const register = async (userData: RegisterData) => {
    const apiUrl = import.meta.env.PROD ? '/api/auth/register' : 'http://localhost:3000/api/auth/register';

    // Convert avatar to base64 if present
    let avatarBase64 = null;
    if (userData.avatar) {
      avatarBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(userData.avatar!);
      });
    }

    const requestBody: any = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      avatar: avatarBase64,
    };

    // Add realtor fields if provided
    if (userData.licenseNumber) requestBody.licenseNumber = userData.licenseNumber;
    if (userData.company) requestBody.company = userData.company;
    if (userData.phone) requestBody.phone = userData.phone;
    if (userData.bio) requestBody.bio = userData.bio;
    if (userData.specialties) requestBody.specialties = userData.specialties;
    if (userData.isRealtor !== undefined) requestBody.isRealtor = userData.isRealtor;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error || 'Registration failed');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
