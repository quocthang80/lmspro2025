import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
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

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  updateStatus: (id, status) => api.put(`/users/${id}/status`, { status }),
  delete: (id) => api.delete(`/users/${id}`),
  bulkCreate: (users) => api.post('/users/bulk', { users }),
};

// Courses API
export const coursesAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (courseData) => api.post('/courses', courseData),
  update: (id, courseData) => api.put(`/courses/${id}`, courseData),
  publish: (id) => api.put(`/courses/${id}/publish`),
  delete: (id) => api.delete(`/courses/${id}`),
  getModules: (id) => api.get(`/courses/${id}/modules`),
  createModule: (id, moduleData) => api.post(`/courses/${id}/modules`, moduleData),
};

// Modules API
export const modulesAPI = {
  getById: (id) => api.get(`/modules/${id}`),
  update: (id, moduleData) => api.put(`/modules/${id}`, moduleData),
  delete: (id) => api.delete(`/modules/${id}`),
  getLessons: (id) => api.get(`/modules/${id}/lessons`),
  createLesson: (id, lessonData) => api.post(`/modules/${id}/lessons`, lessonData),
};

// Lessons API
export const lessonsAPI = {
  getById: (id) => api.get(`/lessons/${id}`),
  update: (id, lessonData) => api.put(`/lessons/${id}`, lessonData),
  delete: (id) => api.delete(`/lessons/${id}`),
  getContents: (id) => api.get(`/lessons/${id}/contents`),
  createContent: (id, contentData) => api.post(`/lessons/${id}/contents`, contentData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateContent: (id, contentData) => api.put(`/lessons/contents/${id}`, contentData),
  deleteContent: (id) => api.delete(`/lessons/contents/${id}`),
};

// Enrollments API
export const enrollmentsAPI = {
  getAll: (params) => api.get('/enrollments', { params }),
  getById: (id) => api.get(`/enrollments/${id}`),
  create: (enrollmentData) => api.post('/enrollments', enrollmentData),
  bulkEnroll: (courseId, userIds) => api.post('/enrollments/bulk', { courseId, userIds }),
  update: (id, enrollmentData) => api.put(`/enrollments/${id}`, enrollmentData),
  delete: (id) => api.delete(`/enrollments/${id}`),
};

// Progress API
export const progressAPI = {
  trackEvent: (eventData) => api.post('/progress/events', eventData),
  getSummary: (params) => api.get('/progress/summary', { params }),
  getDetailed: (enrollmentId, lessonId) => api.get(`/progress/${enrollmentId}/lessons/${lessonId}`),
};

// Quizzes API
export const quizzesAPI = {
  getAll: (params) => api.get('/quizzes', { params }),
  getById: (id, includeAnswers) => api.get(`/quizzes/${id}`, { params: { includeAnswers } }),
  create: (quizData) => api.post('/quizzes', quizData),
  update: (id, quizData) => api.put(`/quizzes/${id}`, quizData),
  delete: (id) => api.delete(`/quizzes/${id}`),
  startAttempt: (id, enrollmentId) => api.post(`/quizzes/${id}/attempts`, { enrollmentId }),
  submitAttempt: (id, responses) => api.post(`/quizzes/attempts/${id}/submit`, { responses }),
  getAttempts: (params) => api.get('/quizzes/attempts', { params }),
};

// Reports API
export const reportsAPI = {
  getAll: (params) => api.get('/reports', { params }),
  generate: (reportData) => api.post('/reports', reportData),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
};

export default api;
