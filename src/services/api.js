import axios from 'axios';

const API_BASE_URL = 'http://localhost:5059/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
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

// Add response interceptor to handle errors and normalize response format
api.interceptors.response.use(
  (response) => {
    // Normalize API response format (Success -> success, Data -> data, Message -> message)
    const normalizeObject = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;

      if (Array.isArray(obj)) {
        return obj.map(item => normalizeObject(item));
      }

      const normalized = {};
      for (const key in obj) {
        const newKey = key.charAt(0).toLowerCase() + key.slice(1);
        // Recursively normalize nested objects
        normalized[newKey] = normalizeObject(obj[key]);
      }
      return normalized;
    };

    response.data = normalizeObject(response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
};

// Prosumer API
export const prosumerAPI = {
  register: async (data) => {
    const response = await api.post('/prosumers/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/prosumers/me');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/prosumers/me', data);
    return response.data;
  },

  requestDeactivation: async () => {
    const response = await api.post('/prosumers/me/request-deactivation');
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/prosumers/me/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};

// User API (for backoffice)
export const userAPI = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await api.post('/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  resetPassword: async (id, newPassword) => {
    const response = await api.post(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },

  updateUserStatus: async (id, status) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  // Role-based tab permissions
  getRoleTabPermissions: async (role) => {
    console.log('API: Getting role tab permissions for:', role);
    const response = await api.get(`/roles/${role}/tabs`);
    console.log('API: Role tab permissions response:', response.data);
    return response.data;
  },

  updateRoleTabPermissions: async (role, visibleTabs) => {
    const response = await api.put(`/roles/${role}/tabs`, { visibleTabs });
    return response.data;
  },

  getAllRoleTabPermissions: async () => {
    const response = await api.get('/roles/tabs');
    return response.data;
  },
};

// Prosumer API (for backoffice)
export const prosumerAdminAPI = {
  getAllProsumers: async (params = {}) => {
    const response = await api.get('/prosumers', { params });
    return response.data;
  },

  getProsumerById: async (id) => {
    const response = await api.get(`/prosumers/${id}`);
    return response.data;
  },

  getProsumerByNic: async (nic) => {
    const response = await api.get(`/prosumers/nic/${nic}`);
    return response.data;
  },

  updateProsumerStatus: async (id, status) => {
    const response = await api.patch(`/prosumers/${id}/status`, { status });
    return response.data;
  },

  getDeactivationRequests: async () => {
    const response = await api.get('/prosumers/deactivation-requests');
    return response.data;
  },

  approveDeactivation: async (id) => {
    const response = await api.post(`/prosumers/${id}/approve-deactivation`);
    return response.data;
  },

  rejectDeactivation: async (id) => {
    const response = await api.post(`/prosumers/${id}/reject-deactivation`);
    return response.data;
  },
};

export const transferAPI = {
  issueQr: async (reservationId) => {
    const response = await api.post(`/transfers/reservations/${reservationId}/issue`);
    return response.data;
  },

  getConfirmation: async (reservationId) => {
    const response = await api.get(`/transfers/reservations/${reservationId}`);
    return response.data;
  },

  verifyQr: async (qrPayload) => {
    const response = await api.post('/transfers/verify', { qrPayload });
    return response.data;
  },

  completeTransfer: async (reservationId) => {
    const response = await api.post(`/transfers/reservations/${reservationId}/complete`);
    return response.data;
  },
};

export default api;