import axios from './axiosConfig';

const api = {
 
  login: (credentials) => axios.post('/login/', credentials),
  register: (userData) => axios.post('/register/', userData),
  
  
  getProjects: () => axios.get('/projects/'),
  getProject: (id) => axios.get(`/projects/${id}/`),
  createProject: (projectData) => axios.post('/projects/', projectData),
  supportProject: (projectId) => axios.post(`/projects/${projectId}/support/`),
  
  
  getComments: (projectId) => axios.get(`/projects/${projectId}/comments/`),
  addComment: (projectId, comment) => axios.post(`/projects/${projectId}/comments/`, comment),
  
  
  getUserProjects: () => axios.get('/projects/user/'),
  getSupportedProjects: () => axios.get('/projects/supported/'),
  getUserStats: () => axios.get('/user/stats/'),
  
  
  createDonationOrder: (projectId, amount) => axios.post('/donations/create_order/', { project_id: projectId, amount }),
  verifyDonationPayment: (data) => axios.post('/donations/verify_payment/', data),
  getMyDonations: () => axios.get('/donations/my/'),

  
  validateToken: () => axios.post('/token/verify/'),
  refreshToken: () => axios.post('/token/refresh/', {
    refresh: localStorage.getItem('refreshToken')
  })
};

export default api;
