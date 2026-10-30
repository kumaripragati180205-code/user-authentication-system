import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Necessary for HTTP-only cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Event emitter pattern for auth events (e.g., token expired or refreshed)
const authListeners = new Set();
export const subscribeAuthEvent = (fn) => {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
};
const notifyAuth = (event, data) => {
  authListeners.forEach((fn) => fn(event, data));
};

// Request interceptor: Attach access token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Automatic token refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and not already retried, and not the login/refresh endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const storedRefreshToken = localStorage.getItem('auth_refresh_token');
        const refreshResponse = await axios.post(
          '/api/auth/refresh',
          { refreshToken: storedRefreshToken },
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem('auth_access_token', newAccessToken);

        notifyAuth('TOKEN_REFRESHED', { accessToken: newAccessToken });
        processQueue(null, newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
        notifyAuth('LOGOUT', null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (data) => api.post('/auth/logout', data),
  refresh: (data) => api.post('/auth/refresh', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  getMe: () => api.get('/auth/me'),
  getInbox: () => api.get('/auth/inbox'),
  getHealth: () => api.get('/health'),
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.patch('/user/profile', data),
  changePassword: (data) => api.post('/user/change-password', data),
};

export const adminApi = {
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getActivityLogs: () => api.get('/admin/audit-logs'),
};

export default api;

