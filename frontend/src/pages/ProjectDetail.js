import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
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
  const [donateOpen, setDonateOpen] = useState(false);
  const [donateAmount, setDonateAmount] = useState(100);
  const [donateLoading, setDonateLoading] = useState(false);
  const [donateError, setDonateError] = useState('');
  // Razorpay script loader
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleDonate = async () => {
    setDonateError('');
    if (donateAmount < 2) {
      setDonateError('Minimum donation is ₹2');
      return;
    }
    setDonateLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setDonateError('Failed to load payment gateway.');
      setDonateLoading(false);
      return;
    }
    try {
      const res = await api.createDonationOrder(project.id, donateAmount);
      const { order_id, razorpay_key, donation_id } = res.data;
      const options = {
        key: razorpay_key,
        amount: donateAmount * 100,
        currency: 'INR',
        name: project.title,
        description: 'Support this project',
        order_id,
        handler: async function (response) {
          try {
            await api.verifyDonationPayment({
              donation_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            setDonateOpen(false);
            alert('Thank you for your donation!');
          } catch (err) {
            setDonateError('Payment verification failed.');
          }
        },
        prefill: {},
        theme: { color: '#1976d2' },
        modal: {
          ondismiss: () => setDonateLoading(false)
        }
      };
      setDonateLoading(false);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setDonateError('Failed to initiate donation.');
      setDonateLoading(false);
    }
  };

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
    return (
      <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 10 }}>
        <Container maxWidth="md">
          <Typography variant="h5" align="center">Loading...</Typography>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 8 }}>
      <Container maxWidth="md">
        <Paper elevation={6} sx={{ p: 5, borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
          <Typography variant="h3" fontWeight={700} color="primary.dark" gutterBottom align="center">
            {project.title}
          </Typography>
          <Typography variant="subtitle1" color="info.main" gutterBottom align="center">
            Category: {project.category}
          </Typography>
          {project.image_url && (
            <Box sx={{ my: 3, display: 'flex', justifyContent: 'center' }}>
              <img 
                src={project.image_url} 
                alt={project.title}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: 16, boxShadow: '0 4px 16px 0 rgba(31, 38, 135, 0.10)' }}
              />
            </Box>
          )}
          <Typography variant="body1" paragraph sx={{ fontSize: 18, mb: 3 }}>
            {project.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<FavoriteIcon />}
              onClick={handleSupport}
              sx={{ fontWeight: 600, fontSize: 18, borderRadius: 3, px: 4 }}
            >
              Support Project
            </Button>
            <Button
              variant="outlined"
              color="success"
              sx={{ fontWeight: 600, fontSize: 18, borderRadius: 3, px: 4 }}
              onClick={() => setDonateOpen(true)}
            >
              Donate
            </Button>
          </Box>

          {/* Donation Dialog */}
          <Dialog open={donateOpen} onClose={() => setDonateOpen(false)}>
            <DialogTitle>Donate to this Project</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>Recommended: ₹100 &nbsp; | &nbsp; Minimum: ₹2</Typography>
              <TextField
                type="number"
                label="Amount (INR)"
                value={donateAmount}
                onChange={e => setDonateAmount(Number(e.target.value))}
                fullWidth
                inputProps={{ min: 2 }}
                sx={{ mb: 2 }}
              />
              {donateError && <Typography color="error.main">{donateError}</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDonateOpen(false)} disabled={donateLoading}>Cancel</Button>
              <Button onClick={handleDonate} variant="contained" disabled={donateLoading}>
                {donateLoading ? <CircularProgress size={22} /> : 'Pay Now'}
              </Button>
            </DialogActions>
          </Dialog>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom color="primary.main" fontWeight={700}>
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
              sx={{ mb: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}
            />
            <Button type="submit" variant="contained" sx={{ fontWeight: 600, borderRadius: 2 }}>
              Post Comment
            </Button>
          </Box>
          <List>
            {comments.map((comment) => (
              <ListItem key={comment.id} alignItems="flex-start" sx={{ bgcolor: '#f8fafc', borderRadius: 2, mb: 1 }}>
                <ListItemText
                  primary={<Typography fontWeight={600} color="primary.dark">{comment.user.username}</Typography>}
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
    </Box>
  );
};

export default ProjectDetail;
