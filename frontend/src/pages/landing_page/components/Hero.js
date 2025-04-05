import * as React from "react";
import { Button, Typography, Box, Container, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalDiningIcon from "@mui/icons-material/LocalDining";

const StyledHero = styled("div")(({ theme }) => ({
  backgroundColor: "#f8f9fa",
  backgroundImage: "linear-gradient(315deg, #f8f9fa 0%, #e9ecef 74%)",
  padding: theme.spacing(12, 0, 6),
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-3px)",
  },
}));

export default function Hero() {
  return (
    <StyledHero>
      <Container maxWidth="lg">
        <Stack
          direction="column"
          spacing={4}
          alignItems="center"
          textAlign="center"
        >
          <Typography
            component="h1"
            variant="h2"
            color="text.primary"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              background: "linear-gradient(45deg, #2A4365 30%, #4299E1 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI-Powered Yoga Journey
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: "sm", mb: 4 }}
          >
            Transform your practice with real-time pose detection, personalized
            guidance, and AI-driven wellness planning
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="center"
          >
            <AnimatedButton
              variant="contained"
              size="large"
              startIcon={<FitnessCenterIcon />}
              sx={{
                bgcolor: "#2B6CB0",
                "&:hover": { bgcolor: "#2C5282" },
              }}
            >
              Start Your Wellness Journey
            </AnimatedButton>
            <AnimatedButton
              variant="outlined"
              size="large"
              startIcon={<LocalDiningIcon />}
              sx={{
                borderColor: "#2B6CB0",
                color: "#2B6CB0",
                "&:hover": {
                  borderColor: "#2C5282",
                  bgcolor: "rgba(43, 108, 176, 0.04)",
                },
              }}
            >
              Build My Diet Plan
            </AnimatedButton>
          </Stack>
        </Stack>
      </Container>
    </StyledHero>
  );
}
