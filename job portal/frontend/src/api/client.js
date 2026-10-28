import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
  withCredentials: true,
});

export const authApi = {
  me: () => client.get('/auth/me'),
  login: (credentials) => client.post('/auth/login', credentials),
  register: (data) => client.post('/auth/register', data),
  logout: () => client.post('/auth/logout'),
};

export const jobsApi = {
  list: (params) => client.get('/jobs', { params }),
  getMine: () => client.get('/jobs/mine'),
  getById: (id) => client.get(`/jobs/${id}`),
  create: (data) => client.post('/jobs', data),
  update: (id, data) => client.patch(`/jobs/${id}`, data),
  delete: (id) => client.delete(`/jobs/${id}`),
  markViewed: (id) => client.post(`/jobs/${id}/view`),
};

export const applicationsApi = {
  create: (formData) =>
    client.post('/applications', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMine: () => client.get('/applications/me'),
  getByJob: (jobId) => client.get(`/applications/job/${jobId}`),
  updateStatus: (id, status) => client.patch(`/applications/${id}/status`, { status }),
};

export const usersApi = {
  getProfile: () => client.get('/users/profile'),
  updateProfile: (formData) =>
    client.patch('/users/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default client;
