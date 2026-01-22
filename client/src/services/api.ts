import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 添加请求拦截器，自动添加token
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

// 添加响应拦截器，处理认证错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface CalendarEvent {
  id?: number;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  user_id?: number;
  created_at?: string;
}

export interface CheckIn {
  id?: number;
  user_id?: number;
  check_in_date: string;
  check_in_time?: string;
  notes?: string;
  created_at?: string;
}

export const authAPI = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const eventsAPI = {
  getEvents: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await api.get(`/events?${params.toString()}`);
    return response.data;
  },

  createEvent: async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id: number, eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id: number) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

export const checkinsAPI = {
  getCheckIns: async (month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const response = await api.get(`/checkins?${params.toString()}`);
    return response.data;
  },

  createCheckIn: async (checkInData: Omit<CheckIn, 'id' | 'user_id' | 'check_in_time' | 'created_at'>) => {
    const response = await api.post('/checkins', checkInData);
    return response.data;
  },

  checkInToday: async (notes?: string) => {
    const response = await api.post('/checkins/today', { notes });
    return response.data;
  },

  hasCheckedInToday: async () => {
    const response = await api.get('/checkins/today');
    return response.data;
  },

  getMonthlyStats: async (year: number, month: number) => {
    const response = await api.get(`/checkins/stats/${year}/${month}`);
    return response.data;
  },
};

export default api;