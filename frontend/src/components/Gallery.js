import React from 'react';
import { Box, Card, CardContent, CardMedia, Typography, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

export function Gallery({ gallery, currentIndex, nextImage, prevImage, role }) {
  if (!gallery || gallery.length === 0) {
    return null;
  }

  const currentItem = gallery[currentIndex];

  return (
    <Card sx={{ maxWidth: '100%', m: 2 }}>
      <CardMedia
        component="img"
        height="400"
        image={currentItem.image}
        alt={`Yoga pose ${currentIndex + 1}`}
        sx={{ objectFit: 'contain' }}
      />
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton 
            onClick={prevImage} 
            disabled={role !== 'mentor' || currentIndex === 0}
          >
            <NavigateBeforeIcon />
          </IconButton>
          
          <Box sx={{ flex: 1, mx: 2 }}>
            <Typography 
              variant="body1" 
              dangerouslySetInnerHTML={{ __html: currentItem.text }}
            />
          </Box>
          
          <IconButton 
            onClick={nextImage} 
            disabled={role !== 'mentor' || currentIndex === gallery.length - 1}
          >
            <NavigateNextIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
}