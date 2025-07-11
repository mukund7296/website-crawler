import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const addURL = (url: string) => api.post('/urls', { url });
export const getURLs = (page: number, limit: number) => api.get(`/urls?page=${page}&limit=${limit}`);
export const analyzeURL = (id: number) => api.post(`/urls/${id}/analyze`);
export const deleteURL = (id: number) => api.delete(`/urls/${id}`);
export const getAnalysis = (id: number) => api.get(`/analyses/${id}`);
