import api from './api';

export const interviewService = {
  start: (category) => api.post('/interviews/start', { category }),
  submitAnswer: (sessionId, questionId, userAnswer) =>
    api.post(`/interviews/${sessionId}/answer`, { questionId, userAnswer }),
  submit: (sessionId) => api.post(`/interviews/${sessionId}/submit`),
  getHistory: () => api.get('/interviews/history'),
  getReport: (sessionId) => api.get(`/interviews/${sessionId}/report`),
};

export const questionService = {
  getAll: (category) => api.get('/questions', { params: { category } }),
  getCategories: () => api.get('/questions/categories'),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post('/questions', data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  remove: (id) => api.delete(`/questions/${id}`),
};

export const adminService = {
  getUsers: () => api.get('/admin/users'),
  getAnalytics: () => api.get('/admin/reports'),
};
