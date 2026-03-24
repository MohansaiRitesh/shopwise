// import axios from 'axios';

// const API_BASE = 'http://localhost:8080/api';

// // Create axios instance
// const api = axios.create({ baseURL: API_BASE });

// // Attach JWT to every request
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Handle 401 → logout
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('token');
//       localStorage.removeItem('user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(err);
//   }
// );

// // Auth
// export const authApi = {
//   login: (data) => api.post('/auth/login', data),
//   register: (data) => api.post('/auth/register', data),
// };

// // Products
// export const productApi = {
//   getAll: (params) => api.get('/products', { params }),
//   getById: (id) => api.get(`/products/${id}`),
//   getFeatured: () => api.get('/products/featured'),
//   getCategories: () => api.get('/products/categories'),
//   search: (keyword, page = 0, size = 12) =>
//     api.get('/products/search', { params: { keyword, page, size } }),
//   create: (data) => api.post('/products', data),
//   update: (id, data) => api.put(`/products/${id}`, data),
//   delete: (id) => api.delete(`/products/${id}`),
// };

// // Users
// export const userApi = {
//   getProfile: () => api.get('/users/me'),
//   updateProfile: (data) => api.put('/users/me', data),
//   changePassword: (data) => api.post('/users/me/password', data),
//   getAllUsers: () => api.get('/users'),
// };

// export default api;

import axios from 'axios';

// Use environment variable
const API_BASE = process.env.REACT_APP_API_URL + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Products
export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  search: (keyword, page = 0, size = 12) =>
    api.get('/products/search', { params: { keyword, page, size } }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Users
export const userApi = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  changePassword: (data) => api.post('/users/me/password', data),
  getAllUsers: () => api.get('/users'),
};

export default api;