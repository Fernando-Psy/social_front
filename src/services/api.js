import axios from 'axios';

// URL da API - prioriza variável de ambiente, depois Heroku, depois localhost
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

console.log('🌐 API URL configurada:', API_URL); // Debug

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

    // Log da requisição (útil para debug)
    console.log('📤 Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para renovar token expirado
api.interceptors.response.use(
  (response) => {
    // Log da resposta bem-sucedida
    console.log('✅ Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log do erro
    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('🔄 Tentando renovar token...');

        const response = await axios.post(`${API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        console.log('✅ Token renovado com sucesso');

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Erro ao renovar token:', refreshError);

        // Limpa dados e redireciona para login
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
  register: (data) => {
    console.log('📝 Registrando usuário:', { ...data, password: '***', password2: '***' });
    return api.post('/auth/register/', data);
  },

  login: (data) => {
    console.log('🔐 Fazendo login:', { username: data.username, password: '***' });
    return api.post('/auth/login/', data);
  },

  updateProfile: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    console.log('👤 Atualizando perfil');
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