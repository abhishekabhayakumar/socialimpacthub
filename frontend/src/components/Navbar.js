import React from 'react';
import { useAuth } from '../context/AuthContext';
import { AppBar, Toolbar, Typography, Button, Container, Box, Avatar } from '@mui/material';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <AppBar position="static" color="default" elevation={2} sx={{ borderRadius: 0, background: 'linear-gradient(90deg, #e0eafc 0%, #cfdef3 100%)' }}>
      <Container maxWidth="lg">
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }}>
              <EmojiObjectsIcon color="warning" />
            </Avatar>
            <Typography variant="h5" component={Link} to="/" sx={{ textDecoration: 'none', color: 'primary.dark', fontWeight: 700, letterSpacing: 1 }}>
              ImpactHub
            </Typography>
          </Box>
          <Button color="primary" variant="outlined" component={Link} to="/projects" sx={{ mx: 1, borderRadius: 3, fontWeight: 600 }}>
            Projects
          </Button>
          <Button color="primary" variant="contained" component={Link} to="/create-project" sx={{ mx: 1, borderRadius: 3, fontWeight: 600 }}>
            Create Project
          </Button>
          {user && (
            <Button color="success" variant="outlined" component={Link} to="/my-donations" sx={{ mx: 1, borderRadius: 3, fontWeight: 600 }}>
              My Donations
            </Button>
          )}
          {!user && (
            <>
              <Button color="secondary" variant="outlined" component={Link} to="/login" sx={{ mx: 1, borderRadius: 3, fontWeight: 600 }}>
                Login
              </Button>
              <Button color="secondary" variant="contained" component={Link} to="/register" sx={{ mx: 1, borderRadius: 3, fontWeight: 600 }}>
                Register
              </Button>
            </>
          )}
          {user && (
            <Button color="secondary" variant="contained" onClick={logout} sx={{ mx: 1, borderRadius: 3, fontWeight: 600 }}>
              Logout
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
