import React from 'react';
import { Box, Typography, LinearProgress, Card, CardContent } from '@mui/material';

const StudentProgress = ({ achievedStudents }) => {
  return (
    <Card sx={{ my: 2, bgcolor: "background.default" }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Student Progress
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body1">
              Students who achieved pose: {achievedStudents.size}
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress
                variant="determinate"
                value={achievedStudents.size * 10}
                sx={{ height: 10, borderRadius: 1 }}
              />
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Students who completed the pose:{" "}
            {Array.from(achievedStudents).join(", ")}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StudentProgress;