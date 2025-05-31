import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DirectPoseAnalysis from './DirectPoseAnalysis';

const ImageGallery = ({ gallery, currentIndex, role, prevImage, nextImage, room, userId }) => {
  return (
    <>
      <Typography variant="h6" gutterBottom>
        Image Gallery
      </Typography>
      {gallery.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            {role === "mentor" && (
              <IconButton
                onClick={prevImage}
                disabled={currentIndex <= 0}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Box
                component="img"
                src={gallery[currentIndex]?.image}
                alt={`yoga-${currentIndex + 1}`}
                sx={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  objectFit: "contain",
                }}
              />
              <Box
                dangerouslySetInnerHTML={{
                  __html: gallery[currentIndex]?.text,
                }}
                sx={{
                  textAlign: "center",
                }}
              />
              {role === "mentee" && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Pose Analysis
                  </Typography>
                  <DirectPoseAnalysis
                    imageUrl={gallery[currentIndex]?.image}
                    room={room}
                    userId={userId}
                  />
                </Box>
              )}
            </Box>
            {role === "mentor" && (
              <IconButton
                onClick={nextImage}
                disabled={currentIndex >= gallery.length - 1}
              >
                <ArrowForwardIcon />
              </IconButton>
            )}
          </Box>
        </Box>
      ) : (
        <Typography>No images to display.</Typography>
      )}
    </>
  );
};

export default ImageGallery;