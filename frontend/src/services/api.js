import axios from './axiosConfig';

const api = {
  // Auth endpoints
  login: (credentials) => axios.post('/login/', credentials),
  register: (userData) => axios.post('/register/', userData),
  
  // Project endpoints
  getProjects: () => axios.get('/projects/'),
  getProject: (id) => axios.get(`/projects/${id}/`),
  createProject: (projectData) => axios.post('/projects/', projectData),
  supportProject: (projectId) => axios.post(`/projects/${projectId}/support/`),
  
  // Comment endpoints
  getComments: (projectId) => axios.get(`/projects/${projectId}/comments/`),
  addComment: (projectId, comment) => axios.post(`/projects/${projectId}/comments/`, comment),
  
  // User dashboard endpoints
  getUserProjects: () => axios.get('/projects/user/'),
  getSupportedProjects: () => axios.get('/projects/supported/'),
  getUserStats: () => axios.get('/user/stats/'),
  
  // Token validation
  validateToken: () => axios.post('/token/verify/'),
  refreshToken: () => axios.post('/token/refresh/', {
    refresh: localStorage.getItem('refreshToken')
  })
};

export default api;
