import * as React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import CameraIcon from '@mui/icons-material/Camera';
import GroupIcon from '@mui/icons-material/Group';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const features = [
  {
    title: 'Real-Time Pose Detection',
    description: 'Get instant feedback on your yoga poses with AI-powered analysis and personalized corrections.',
    icon: <CameraIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: 'Mentor-Led Sessions',
    description: 'Join live sessions with experienced mentors guiding you through synchronized yoga flows.',
    icon: <GroupIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: 'Smart Diet Planning',
    description: 'Receive customized meal plans and nutrition advice from our AI wellness coach.',
    icon: <RestaurantIcon sx={{ fontSize: 40 }} />,
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your wellness journey with integrated calorie tracking and pose improvement metrics.',
    icon: <ShowChartIcon sx={{ fontSize: 40 }} />,
  },
];

// export default function Features() {
//   return (
//     <Box
//       sx={{
//         py: 8,
//         bgcolor: 'background.paper',
//       }}
//     >
//       <Container>
//         <Grid container spacing={4}>
//           {features.map((feature, index) => (
//             <Grid item xs={12} sm={6} md={3} key={index}>
//               <Box
//                 sx={{
//                   p: 2,
//                   height: '100%',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   alignItems: 'center',
//                   textAlign: 'center',
//                   borderRadius: 2,
//                   transition: 'transform 0.3s ease-in-out',
//                   '&:hover': {
//                     transform: 'translateY(-8px)',
//                     boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//                   },
//                 }}
//               >
//                 <Box
//                   sx={{
//                     mb: 2,
//                     p: 2,
//                     borderRadius: '50%',
//                     bgcolor: 'primary.light',
//                     color: 'primary.main',
//                   }}
//                 >
//                   {feature.icon}
//                 </Box>
//                 <Typography
//                   variant="h6"
//                   component="h3"
//                   sx={{ mb: 2, fontWeight: 'bold' }}
//                 >
//                   {feature.title}
//                 </Typography>
//                 <Typography
//                   variant="body2"
//                   color="text.secondary"
//                 >
//                   {feature.description}
//                 </Typography>
//               </Box>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>
//     </Box>
//   );
// }  

export default function Features() {
  return (
    <Box
      id="features"
      sx={{
        py: 8,
        bgcolor: "background.paper",
        scrollMarginTop: "80px",
      }}
    >
      <Container maxWidth="lg">
        <Typography
          component="h2"
          variant="h3"
          textAlign="center"
          mb={6}
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #2A4365 30%, #4299E1 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Key Features
        </Typography>

        <Grid
          container
          spacing={4}
          justifyContent="center"
          sx={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Box
                sx={{
                  p: 4,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  borderRadius: 4,
                  transition: "all 0.3s ease-in-out",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                    backgroundColor: "rgba(255, 255, 255, 1)",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    color: "primary.main",
                    transform: "scale(1.2)",
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography
                  variant="h5"
                  component="h3"
                  sx={{
                    mb: 2,
                    fontWeight: "bold",
                    color: "primary.dark",
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.7,
                    maxWidth: "300px",
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
