import axios from 'axios';
import { Room, RoomStats, CreateRoomDto, CheckInDto, RoomStatus, RoomType } from '../types/room';

// Cache localStorage token to avoid repeated reads (js-cache-storage)
let cachedToken: string | null = null;
let tokenCacheTime = 0;
const TOKEN_CACHE_DURATION = 5000; // Cache for 5 seconds

const getToken = (): string | null => {
  const now = Date.now();
  if (cachedToken !== null && now - tokenCacheTime < TOKEN_CACHE_DURATION) {
    return cachedToken;
  }
  cachedToken = localStorage.getItem('hotel_auth_token');
  tokenCacheTime = now;
  return cachedToken;
};

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Cache URL search params construction (js-cache-function-results)
const paramsCache = new Map<string, URLSearchParams>();

const buildParams = (filters?: { floor?: number; status?: RoomStatus; type?: RoomType }): URLSearchParams => {
  const key = JSON.stringify(filters);
  if (paramsCache.has(key)) {
    return paramsCache.get(key)!;
  }
  
  const params = new URLSearchParams();
  if (filters?.floor) params.append('floor', filters.floor.toString());
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);
  
  paramsCache.set(key, params);
  return params;
};

export const roomsApi = {
  getAll: async (filters?: { floor?: number; status?: RoomStatus; type?: RoomType }) => {
    const params = buildParams(filters);
    const { data } = await api.get<Room[]>(`/rooms?${params.toString()}`);
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Room>(`/rooms/${id}`);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get<RoomStats>('/rooms/stats');
    return data;
  },

  create: async (dto: CreateRoomDto) => {
    const { data } = await api.post<Room>('/rooms', dto);
    return data;
  },

  update: async (id: string, dto: Partial<Room>) => {
    const { data } = await api.put<Room>(`/rooms/${id}`, dto);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/rooms/${id}`);
  },

  checkIn: async (id: string, dto: CheckInDto) => {
    const { data } = await api.post<Room>(`/rooms/${id}/check-in`, dto);
    return data;
  },

  checkOut: async (id: string) => {
    const { data } = await api.post<Room>(`/rooms/${id}/check-out`);
    return data;
  },

  completeCleaning: async (id: string) => {
    const { data } = await api.patch<Room>(`/rooms/${id}/cleaning-complete`);
    return data;
  },
};

export default api;
