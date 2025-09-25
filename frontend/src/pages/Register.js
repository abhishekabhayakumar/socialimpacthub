import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Register = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.username || !formData.email || !formData.password || !formData.password2) {
      showNotification('Please fill in all fields', 'error');
      return;
    }
    
    if (formData.password !== formData.password2) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      await register(registrationData);
      showNotification('Registration successful! Please login.', 'success');
      navigate('/login');
    } catch (error) {
      // Log error details for debugging
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      const errorMessage = error.message.includes('\n') 
        ? error.message.split('\n').map(msg => msg.trim()).join('\n')
        : error.message;
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 10 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 5, borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
          <Typography variant="h3" align="center" fontWeight={700} color="primary.dark" gutterBottom>
            Register
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              sx={{ bgcolor: '#f5f7fa', borderRadius: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ bgcolor: '#f5f7fa', borderRadius: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              sx={{ bgcolor: '#f5f7fa', borderRadius: 2 }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              required
              value={formData.password2}
              onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
              sx={{ bgcolor: '#f5f7fa', borderRadius: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, fontWeight: 600, fontSize: 18, borderRadius: 3, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
