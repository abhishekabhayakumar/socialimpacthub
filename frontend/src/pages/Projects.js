import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Grid, 
  Typography, 
  TextField, 
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton
} from '@mui/material';
import ProjectCard from '../components/ProjectCard';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const IMPACT_AREAS = [
  { label: 'All Areas', value: 'all' },
  { label: 'Environmental', value: 'environmental' },
  { label: 'Social Justice', value: 'social' },
  { label: 'Education', value: 'education' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Economic Empowerment', value: 'economic' }
];

const SORT_OPTIONS = [
  { label: 'Most Recent', value: 'recent' },
  { label: 'Most Supported', value: 'supported' },
  { label: 'Alphabetical', value: 'alpha' }
];

const Projects = () => {
  const { showNotification } = useNotification();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [impactArea, setImpactArea] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await api.getProjects();
        setProjects(response.data);
      } catch (error) {
        showNotification('Error loading projects. Please try again.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [showNotification]);

  const sortProjects = (projects) => {
    if (!Array.isArray(projects)) return [];
    
    switch (sortBy) {
      case 'recent':
        return [...projects].sort((a, b) => 
          new Date(b.created_at || 0) - new Date(a.created_at || 0));
      case 'supported':
        return [...projects].sort((a, b) => 
          (b.supporters_count || 0) - (a.supporters_count || 0));
      case 'alpha':
        return [...projects].sort((a, b) => 
          (a.title || '').localeCompare(b.title || ''));
      default:
        return projects;
    }
  };

  const filteredProjects = projects.filter(project => {
    if (!project) return false;
    
    const titleMatch = project.title
      ? project.title.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
      
    const areaMatch = impactArea === 'all' || 
      (project.impact_area && project.impact_area === impactArea);
      
    return titleMatch && areaMatch;
  });

  const handleSupportToggle = (projectId, isSupported) => {
    if (!projectId) return;
    
    setProjects(prevProjects => 
      prevProjects.map(project => {
        if (!project || project.id !== projectId) return project;
        
        const currentCount = project.supporters_count || 0;
        return { 
          ...project, 
          is_supported: isSupported,
          supporters_count: isSupported 
            ? currentCount + 1 
            : Math.max(0, currentCount - 1)
        };
      })
    );
  };

  const sortedProjects = sortProjects(filteredProjects);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 6 }}>
      <Container maxWidth="lg">
        <Typography variant="h3" fontWeight={700} color="primary.dark" gutterBottom align="center" sx={{ mb: 4, letterSpacing: 1 }}>
          Explore Projects
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search projects"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ bgcolor: '#f5f7fa', borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Impact Area</InputLabel>
              <Select
                value={impactArea}
                label="Impact Area"
                onChange={(e) => setImpactArea(e.target.value)}
                sx={{ bgcolor: '#f5f7fa', borderRadius: 2 }}
              >
                {IMPACT_AREAS.map(area => (
                  <MenuItem key={area.value} value={area.value}>
                    {area.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ bgcolor: '#f5f7fa', borderRadius: 2 }}
              >
                {SORT_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={4}>
          {loading ? (
            Array(6).fill(0).map((_, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <Skeleton 
                  variant="rectangular" 
                  height={300}
                  sx={{ borderRadius: 4 }}
                />
              </Grid>
            ))
          ) : sortedProjects.length > 0 ? (
            sortedProjects.map((project) => (
              <Grid item key={project.id} xs={12} sm={6} md={4}>
                <ProjectCard 
                  project={project} 
                  onSupportToggle={handleSupportToggle}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Typography variant="h6" align="center" color="text.secondary">
                No projects found matching your criteria
              </Typography>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Projects;
