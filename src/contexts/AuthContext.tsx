import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/hooks/apiService';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: string;
  email: string;
  name: string;
  guildIds: string[];
}

interface JWTPayload {
  sub: string;
  email: string;
  guildIds: string[];
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: ({email, password, name}: {email: string, password: string, name: string}) => Promise<void>;
  assignGuild: (ownerId: string, guildId: string, password: string) => Promise<void>;
  checkLogin: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data and token on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser({
            ...userData,
            guildIds: decoded.guildIds
          });
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      const decoded = jwtDecode<JWTPayload>(response.accessToken);
      
      const userData = {
        id: response.owner.id,
        email: response.owner.email,
        name: response.owner.name,
        guildIds: decoded.guildIds
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } finally {
      setIsLoading(false);
    }
  };

  const checkLogin = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async ({email, password, name}: {email: string, password: string, name: string}) => {
    setIsLoading(true);
    try {
      const response = await authService.register({email, password, name});
      // After registration, automatically log in
      await login(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  const assignGuild = async (ownerId: string, guildId: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.assignGuild(ownerId, guildId);
      // Refresh token to get updated guild list
      if (user) {
        await login(user.email, password);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register, assignGuild, checkLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}