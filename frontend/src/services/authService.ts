import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
}

const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

const refreshToken = async () => {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post<{ access: string }>(`${API_URL}/token/refresh/`, {
      refresh,
    });
    
    setAuthToken(response.data.access);
    return response.data.access;
  } catch (error) {
    logout();
    throw error;
  }
};

const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/token/`, credentials);
    
    setAuthToken(response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = () => {
  setAuthToken(null);
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

const isAuthenticated = () => {
  return !!getAuthToken();
};

const isAdmin = () => {
  const user = getCurrentUser();
  return user ? user.role == 'ADMIN' : false;
};

// Setup axios interceptor for token refresh
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const token = await refreshToken();
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Initialize auth header from localStorage on app load
const initAuthHeader = () => {
  const token = getAuthToken();
  if (token) {
    setAuthToken(token);
  }
};

export const authService = {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  initAuthHeader
};

export default authService; 