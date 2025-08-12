import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is due to an expired token and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Attempt to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await instance.post('/token/refresh/', {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return instance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and throw error
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        throw new Error('Session expired. Please login again.');
      }
    }

    // Handle other types of errors
    if (error.response?.data) {
      const data = error.response.data;
      
      if (typeof data === 'object' && data !== null) {
        // If the error response contains field-specific errors
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          throw new Error(firstError[0]);
        } else if (typeof firstError === 'string') {
          throw new Error(firstError);
        }
      }
      
      // If there's a detail message in the response
      if (data.detail) {
        throw new Error(data.detail);
      }
    }
    
    // Generic error message if we can't parse the error response
    throw new Error(error.message || 'An error occurred. Please try again.');
  }
);

export default instance;
