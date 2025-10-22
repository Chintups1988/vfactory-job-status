import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5001/api', // Backend server URL
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor to add auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found in localStorage for request:', config.url);
    }
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      headers: config.headers
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => {
    console.log('API Response Success:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      message: error.message,
      code: error.code,
      response: error.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      } : null,
      request: error.request ? 'Network request failed' : null,
      config: {
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        method: error.config?.method
      }
    });
    
    // Handle network errors with more specific messages
    if (!error.response) {
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        throw new Error('Connection refused. Backend server may not be running on port 5001. Please ensure the backend is started.');
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        throw new Error('Network Error. Unable to reach the backend server. Please check your connection and that the backend is running.');
      } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
        throw new Error('Request timeout. The backend server is taking too long to respond.');
      } else {
        throw new Error(`Network error: ${error.message || 'Unable to connect to backend server.'}`);
      }
    }
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
