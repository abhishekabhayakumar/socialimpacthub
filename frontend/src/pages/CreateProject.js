import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    impact_area: '',
    description: '',
    image_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Remove image_url if empty string
    const payload = { ...formData };
    if (!payload.image_url || payload.image_url.trim() === '') {
      delete payload.image_url;
    }
    console.log('Submitting project payload:', payload);
    try {
      await api.createProject(payload);
      navigate('/projects');
    } catch (error) {
      if (error.response) {
        console.error('Backend error:', error.response.data);
      }
      console.error('Project creation failed:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create New Project
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Project Title"
            margin="normal"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            fullWidth
            label="Impact Area"
            margin="normal"
            required
            value={formData.impact_area}
            onChange={(e) => setFormData({ ...formData, impact_area: e.target.value })}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={4}
            margin="normal"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <TextField
            fullWidth
            label="Image URL"
            margin="normal"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3 }}
          >
            Create Project
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProject;
