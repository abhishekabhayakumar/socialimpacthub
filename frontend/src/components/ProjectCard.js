import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  CardActions, 
  Box,
  Chip,
  IconButton,
  Tooltip,
  TextField
} from '@mui/material';
import { Link } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const ProjectCard = ({ project, onSupportToggle }) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [isSupporting, setIsSupporting] = useState(project.is_supported);
  const [supportCount, setSupportCount] = useState(project.supporters_count || 0);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  // Fetch comments for this project
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.getComments(project.id);
        setComments(res.data);
      } catch (err) {
        // Optionally show notification
      }
    };
    fetchComments();
  }, [project.id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      showNotification('Please login to comment', 'warning');
      return;
    }
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      await api.addComment(project.id, { content: newComment });
      setNewComment('');
      // Refresh comments
      const res = await api.getComments(project.id);
      setComments(res.data);
      showNotification('Comment added!', 'success');
    } catch (err) {
      showNotification('Failed to add comment.', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleSupportClick = async () => {
    if (!user) {
      showNotification('Please login to support projects', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.supportProject(project.id);
      setIsSupporting(!isSupporting);
      setSupportCount(isSupporting ? supportCount - 1 : supportCount + 1);
      showNotification(
        isSupporting ? 'Support removed' : 'Project supported!',
        'success'
      );
      if (onSupportToggle) {
        onSupportToggle(project.id, !isSupporting);
      }
    } catch (error) {
      showNotification('Failed to update support. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Use a fallback image if image_url is missing, empty, or not a valid URL
  const getImageUrl = (url) => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return 'https://via.placeholder.com/300x140';
    }
    // Optionally, add more validation for URL format here
    return url;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={getImageUrl(project.image_url)}
        alt={project.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {project.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {project.description?.substring(0, 150) || ''}...
        </Typography>
        <Box mt={2} display="flex" alignItems="center" gap={1}>
          <Chip 
            label={project.impact_area} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
          <Chip
            icon={<FavoriteIcon sx={{ fontSize: '16px' }} />}
            label={supportCount}
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Comment Section */}
        <Box mt={3}>
          <Typography variant="subtitle1" gutterBottom>Comments</Typography>
          <Box component="form" onSubmit={handleAddComment} display="flex" gap={1} mb={2}>
            <TextField
              fullWidth
              size="small"
              label="Add a comment"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              disabled={commentLoading}
            />
            <Button type="submit" variant="contained" disabled={commentLoading || !newComment.trim()}>
              Post
            </Button>
          </Box>
          <Box maxHeight={120} sx={{ overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
            ) : (
              comments.map((c) => (
                <Box key={c.id} mb={1}>
                  <Typography variant="body2" fontWeight="bold">{c.user?.username || 'User'}</Typography>
                  <Typography variant="body2">{c.content}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Button size="small" component={Link} to={`/projects/${project.id}`}>
          Learn More
        </Button>
        <Tooltip title={user ? 'Support this project' : 'Login to support'}>
          <IconButton 
            size="small" 
            onClick={handleSupportClick}
            disabled={loading}
            color={isSupporting ? 'error' : 'default'}
          >
            {isSupporting ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default ProjectCard;
