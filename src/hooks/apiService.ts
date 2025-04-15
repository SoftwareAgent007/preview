import { DateRange } from "react-day-picker";
import { jwtDecode } from 'jwt-decode';

type ApiService<T> = {
  getData: (endpoint: string) => Promise<T>;
  postData: (endpoint: string, body: any, guildId: string) => Promise<T>;
  deleteData: (endpoint: string, guildId: string) => Promise<T>;
  patchData: (endpoint: string, body: any, guildId: string) => Promise<T>;
  putData: (endpoint: string, body: any, guildId: string) => Promise<T>;
};

export const DEFAULT_START_DATE = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();
export const DEFAULT_END_DATE = new Date().toISOString();

export const DEFAULT_DATE_RANGE: DateRange = {
  from: new Date(DEFAULT_START_DATE),
  to: new Date(DEFAULT_END_DATE)
};

const API_CONTROL_URL = import.meta.env.VITE_API_ANALYTICS_URL || '';
const IS_DEV = import.meta.env.VITE_MODE === 'development';

const getAuthToken = () => localStorage.getItem('auth_token');
const setAuthToken = (token: string) => localStorage.setItem('auth_token', token);
const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const isTokenExpired = (token: string) => {
  try {
    const decoded = jwtDecode<{exp: number}>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const requestInterceptor = (url: string, options: RequestInit) => {
  const token = getAuthToken();
  
  if (token && isTokenExpired(token)) {
    removeAuthToken();
    throw new Error('Token expired');
  }
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
  
  const interceptedOptions = {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    ...(IS_DEV && {
      rejectUnauthorized: false
    })
  };

  return { url, options: interceptedOptions };
};

const responseInterceptor = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    if (response.status === 401) {
      removeAuthToken();
      throw new Error('Session expired');
    }
    throw new Error(errorData?.message || `API Error: ${response.statusText}`);
  }
  const data = await response.json();
  return data.body;
};

const createApiService = <T>(baseUrl: string): ApiService<T> => {
  const getData = async (endpoint: string): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}`, { method: 'GET' });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const postData = async (endpoint: string, body: any, guildId: string): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    if (!guildId) throw new Error("guildId is required!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}?guildId=${guildId}`, {
      method: 'POST',
      body
    });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const deleteData = async (endpoint: string, guildId: string): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    if (!guildId) throw new Error("guildId is required!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}?guildId=${guildId}`, { method: 'DELETE' });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const patchData = async (endpoint: string, body: any, guildId: string ): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    if (!guildId) throw new Error("guildId is required!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}?guildId=${guildId}`, {
      method: 'PATCH',
      body
    });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  const putData = async (endpoint: string, body: any, guildId: string): Promise<T> => {
    if (!baseUrl) throw new Error("API URL is missing!");
    if (!guildId) throw new Error("guildId is required!");
    const { url, options } = requestInterceptor(`${baseUrl}${endpoint}?guildId=${guildId}`, {
      method: 'PUT',
      body
    });
    const response = await fetch(url, options);
    return responseInterceptor(response);
  };

  return { getData, postData, deleteData, patchData, putData };
};

export const apiService = createApiService<any>(API_CONTROL_URL);

// Auth specific methods
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_CONTROL_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await responseInterceptor(response);
      if (data.error?.name === 'UnauthorizedException') {
        throw new Error('Invalid credentials');
      }
      setAuthToken(data.accessToken);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Login failed');
    }
  },

  register: async ({email, password, name}: {email: string, password: string, name: string}) => {
    try {
      if (!email || !password || password.length < 8) {
        throw new Error('Invalid registration data');
      }

      const response = await fetch(`${API_CONTROL_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });

      const data = await responseInterceptor(response);
      if (data.error) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Registration failed');
    }
  },

  assignGuild: async (ownerId: string, guildId: string) => {
    try {
      if (!ownerId || !guildId) {
        throw new Error('Owner ID and Guild ID are required');
      }

      const response = await fetch(`${API_CONTROL_URL}/auth/assign-guild`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId, guildId })
      });

      const data = await responseInterceptor(response);
      if (data.error) {
        throw new Error(data.message || 'Guild assignment failed');
      }
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Guild assignment failed');
    }
  },

  logout: () => {
    removeAuthToken();
  }
};
