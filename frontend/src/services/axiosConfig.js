import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


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


instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        const response = await instance.post('/token/refresh/', {
          refresh: refreshToken
        });
        
        const { access } = response.data;
        localStorage.setItem('token', access);
        
        
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return instance(originalRequest);
      } catch (refreshError) {
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        throw new Error('Session expired. Please login again.');
      }
    }

   
    if (error.response?.data) {
      const data = error.response.data;
      
      if (typeof data === 'object' && data !== null) {
        
        const firstError = Object.values(data)[0];
        if (Array.isArray(firstError)) {
          throw new Error(firstError[0]);
        } else if (typeof firstError === 'string') {
          throw new Error(firstError);
        }
      }
      
     
      if (data.detail) {
        throw new Error(data.detail);
      }
    }
    
    
    throw new Error(error.message || 'An error occurred. Please try again.');
  }
);

export default instance;
