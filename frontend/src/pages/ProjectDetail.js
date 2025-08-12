import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import api from '../services/api';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchProjectAndComments = async () => {
      try {
        const projectResponse = await api.getProject(id);
        setProject(projectResponse.data);
        const commentsResponse = await api.getComments(id);
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };
    fetchProjectAndComments();
  }, [id]);

  const handleSupport = async () => {
    try {
      await api.supportProject(id);
      // Refresh project data to update support count
      const response = await api.getProject(id);
      setProject(response.data);
    } catch (error) {
      console.error('Error supporting project:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      await api.addComment(id, { comment_text: newComment });
      const response = await api.getComments(id);
      setComments(response.data);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!project) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {project.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Category: {project.category}
        </Typography>
        
        {project.image_url && (
          <Box sx={{ my: 2 }}>
            <img 
              src={project.image_url} 
              alt={project.title}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            />
          </Box>
        )}

        <Typography variant="body1" paragraph>
          {project.description}
        </Typography>

        <Button
          variant="contained"
          startIcon={<FavoriteIcon />}
          onClick={handleSupport}
          sx={{ mt: 2 }}
        >
          Support Project
        </Button>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        
        <Box component="form" onSubmit={handleComment} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="Add a comment"
            multiline
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button type="submit" variant="contained">
            Post Comment
          </Button>
        </Box>

        <List>
          {comments.map((comment) => (
            <ListItem key={comment.id} alignItems="flex-start">
              <ListItemText
                primary={comment.user.username}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {comment.comment_text}
                    </Typography>
                    {` — ${new Date(comment.timestamp).toLocaleDateString()}`}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default ProjectDetail;
