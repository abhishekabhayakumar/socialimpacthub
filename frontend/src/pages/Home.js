import React from 'react';
import { Container, Typography, Button, Box, Grid } from '@mui/material';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 10 }}>
      <Container maxWidth="md">
        <Box sx={{
          p: 6,
          borderRadius: 4,
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e0eafc 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="primary.dark"
            fontWeight={700}
            gutterBottom
            sx={{ letterSpacing: 2 }}
          >
            Welcome to ImpactHub
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph sx={{ mb: 3 }}>
            Connect with change-makers, support social causes, and make a difference in your community.
            Join our platform to discover inspiring projects or share your own initiative.
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item>
                <Button variant="contained" color="primary" size="large" component={Link} to="/projects" sx={{ borderRadius: 3, fontWeight: 600, px: 4 }}>
                  Explore Projects
                </Button>
              </Grid>
              <Grid item>
                <Button variant="outlined" color="primary" size="large" component={Link} to="/create-project" sx={{ borderRadius: 3, fontWeight: 600, px: 4 }}>
                  Start a Project
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
