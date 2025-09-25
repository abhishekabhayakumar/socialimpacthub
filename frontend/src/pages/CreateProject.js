import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Avatar, Divider, InputAdornment } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
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
  const [submissionStatus, setSubmissionStatus] = useState(null); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
    if (!payload.image_url || payload.image_url.trim() === '') {
      delete payload.image_url;
    }
    try {
      await api.createProject(payload);
      setSubmissionStatus({ accepted: true, message: 'Project accepted as social impact and created successfully.' });
      setTimeout(() => navigate('/projects'), 1500);
    } catch (error) {
      let msg = 'Project creation failed.';
      let accepted = false;
      if (error.response && error.response.data) {
        
        if (typeof error.response.data.reason === 'string' && error.response.data.reason.trim() !== '') {
          msg = error.response.data.reason;
        } else if (typeof error.response.data.detail === 'string') {
          msg = error.response.data.detail;
        }
        if (typeof error.response.data.accepted === 'boolean') {
          accepted = error.response.data.accepted;
        }
      }
      setSubmissionStatus({ accepted, message: msg });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 8 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 5, borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mb: 1 }}>
              <AddCircleOutlineIcon sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h4" align="center" fontWeight={700} gutterBottom color="primary.dark">
              Create New Project
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 1 }}>
              Share your impactful idea with the world!
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          {submissionStatus && (
            <Box sx={{ mb: 2 }}>
              <Typography align="center" color={submissionStatus.accepted ? 'success.main' : 'error.main'} fontWeight={600}>
                {submissionStatus.message}
              </Typography>
            </Box>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Project Title"
              margin="normal"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmojiObjectsIcon color="warning" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Impact Area"
              margin="normal"
              required
              value={formData.impact_area}
              onChange={(e) => setFormData({ ...formData, impact_area: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AddCircleOutlineIcon color="info" />
                  </InputAdornment>
                )
              }}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmojiObjectsIcon color="secondary" />
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Image URL"
              margin="normal"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AddCircleOutlineIcon color="success" />
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, py: 1.5, fontWeight: 600, fontSize: 18, letterSpacing: 1 }}
            >
              Create Project
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default CreateProject;
