import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://intense-meadow-21950-fa90af6f25e4.herokuapp.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para renovar token expirado
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.put('/auth/profile/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Posts
export const postsAPI = {
  getAll: () => api.get('/posts/'),
  getById: (id) => api.get(`/posts/${id}/`),
  create: (data) => {
    const formData = new FormData();
    formData.append('content', data.content);
    if (data.image) {
      formData.append('image', data.image);
    }
    return api.post('/posts/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.put(`/posts/${id}/`, data),
  delete: (id) => api.delete(`/posts/${id}/`),
  like: (id) => api.post(`/posts/${id}/like/`),
  unlike: (id) => api.post(`/posts/${id}/unlike/`),
  comment: (id, content) => api.post(`/posts/${id}/comment/`, { content }),
  getComments: (id) => api.get(`/posts/${id}/comments/`),
};

// Follows
export const followsAPI = {
  follow: (userId) => api.post(`/follows/${userId}/follow/`),
  unfollow: (userId) => api.delete(`/follows/${userId}/unfollow/`),
  getFollowing: () => api.get('/follows/following/'),
  getFollowers: () => api.get('/follows/followers/'),
};

export default api;