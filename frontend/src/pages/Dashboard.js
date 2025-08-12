import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Typography,
  Paper,
  Box,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Skeleton,
  Chip
} from '@mui/material';
import {

  CreateOutlined as CreateIcon,
  FavoriteBorder as SupportIcon,
  InsertChart as StatsIcon
} from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalSupported: 0,
    impactReach: 0
  });
  const [myProjects, setMyProjects] = useState([]);
  const [supportedProjects, setSupportedProjects] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [projectsRes, supportedRes, statsRes] = await Promise.all([
          api.getUserProjects(),
          api.getSupportedProjects(),
          api.getUserStats()
        ]);

        setMyProjects(projectsRes.data);
        setSupportedProjects(supportedRes.data);
        setStats(statsRes.data);
      } catch (error) {
        showNotification('Error loading dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [showNotification]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  const renderProjectList = (projects) => {
    if (loading) {
      return Array(3).fill(0).map((_, index) => (
        <ListItem key={index} divider>
          <Skeleton variant="rectangular" width="100%" height={80} />
        </ListItem>
      ));
    }

    return projects.length > 0 ? (
      projects.map((project) => (
        <ListItem key={project.id} divider>
          <ListItemAvatar>
            <Avatar>{project.title[0]}</Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={project.title}
            secondary={
              <>
                <Typography component="span" variant="body2" color="text.primary">
                  {project.impact_area}
                </Typography>
                {" — "}{project.description.substring(0, 100)}...
              </>
            }
          />
          <Chip 
            label={`${project.supporters_count} supporters`}
            color="primary"
            size="small"
            sx={{ ml: 2 }}
          />
        </ListItem>
      ))
    ) : (
      <ListItem>
        <ListItemText 
          primary="No projects found"
          secondary="Start creating or supporting projects to see them here"
        />
      </ListItem>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* User Profile Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ width: 64, height: 64, mr: 2 }}>
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h5">{user?.username}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4">{stats.totalProjects}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects Created
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4">{stats.totalSupported}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects Supported
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box textAlign="center">
                  <Typography variant="h4">{stats.impactReach}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Impact Reach
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Projects and Activities Section */}
        <Grid item xs={12}>
          <Paper elevation={3}>
            <Tabs
              value={value}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab icon={<CreateIcon />} label="MY PROJECTS" />
              <Tab icon={<SupportIcon />} label="SUPPORTED" />
              <Tab icon={<StatsIcon />} label="IMPACT" />
            </Tabs>
            
            <TabPanel value={value} index={0}>
              <List sx={{ width: '100%' }}>
                {renderProjectList(myProjects)}
              </List>
            </TabPanel>
            
            <TabPanel value={value} index={1}>
              <List sx={{ width: '100%' }}>
                {renderProjectList(supportedProjects)}
              </List>
            </TabPanel>
            
            <TabPanel value={value} index={2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Your Impact Overview
                  </Typography>
                  {/* Add impact visualization components here */}
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
