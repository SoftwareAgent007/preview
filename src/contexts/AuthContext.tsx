import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/hooks/apiService';
import { jwtDecode } from 'jwt-decode';
import { useDashboardContext } from '@/common/context/queryContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routes.constant';

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
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: ({email, password, name}: {email: string, password: string, name: string}) => Promise<void>;
  assignGuild: (ownerId: string, guildId: string, password: string) => Promise<void>;
  checkLogin: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setGuildId } = useDashboardContext();
  const navigate = useNavigate();

  const checkTokenExpiration = (token: string) => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        setUser(null);
        navigate(ROUTES.LOGIN);
        return true;
      }
      return false;
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      navigate(ROUTES.LOGIN);
      return true;
    }
  };

  useEffect(() => {
    // Check for stored user data and token on mount
    const token = localStorage.getItem('auth_token');
    if (token) {
      if (!checkTokenExpiration(token)) {
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
          navigate(ROUTES.LOGIN);
        }
      }
    }
    setIsLoading(false);
  }, [navigate]);

  const login = async (email: string, password: string): Promise<User> => {
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
      console.log('userData', userData);
      
      // Only set guildId if the user has guilds
      if (userData.guildIds && userData.guildIds.length > 0) {
        setGuildId('1306748279903621142');
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
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