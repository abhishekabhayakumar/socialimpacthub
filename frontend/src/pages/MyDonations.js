import React, { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import api from '../services/api';

const MyDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const res = await api.getMyDonations();
        setDonations(res.data);
      } catch (err) {
        setDonations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 8 }}>
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 5, borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}>
          <Typography variant="h4" fontWeight={700} color="primary.dark" gutterBottom align="center">
            My Donations
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
            </Box>
          ) : donations.length === 0 ? (
            <Typography align="center" color="text.secondary">No donations yet.</Typography>
          ) : (
            <List>
              {donations.map(donation => (
                <ListItem key={donation.id} sx={{ bgcolor: '#f8fafc', borderRadius: 2, mb: 1 }}>
                  <ListItemText
                    primary={<>
                      <Typography fontWeight={600}>{donation.project_title}</Typography>
                      <Chip label={donation.status} color={donation.status === 'paid' ? 'success' : 'warning'} size="small" sx={{ ml: 2 }} />
                    </>}
                    secondary={<>
                      <Typography component="span" variant="body2" color="text.primary">
                        Amount: ₹{donation.amount}
                      </Typography>
                      {` — ${new Date(donation.created_at).toLocaleString()}`}
                    </>}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default MyDonations;
