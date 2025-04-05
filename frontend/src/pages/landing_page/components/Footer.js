import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
      {"Copyright © "}
      <Link color="inherit" href="/">
        PoseMaster
      </Link>{" "}
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: "center", md: "left" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
          gap: { xs: 4, sm: 8 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: { xs: "100%", sm: "50%" },
            maxWidth: { xs: "100%", sm: "50%" }, // Add maxWidth constraint
          }}
        >
          <Box sx={{ display: "flex", alignItems: "left", }}>
            <SelfImprovementIcon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" color="text.primary">
              PoseMaster
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" 
            sx={{ maxWidth:"100%",pr:{sm: 2}}}>
            Transform your yoga practice with AI-powered guidance and expert
            mentorship. Join our community of wellness enthusiasts today.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 10,
            mt: { xs: 4, sm: 0 },
          }}
        >
          <Box>
            <Typography variant="body2" fontWeight="bold" mb={2}>
              Features
            </Typography>
            <Stack spacing={1}>
              <Link color="text.secondary" href="#features">
                AI Pose Detection
              </Link>
              <Link color="text.secondary" href="#features">
                Live Sessions
              </Link>
              <Link color="text.secondary" href="#features">
                Diet Planning
              </Link>
              <Link color="text.secondary" href="#features">
                Progress Tracking
              </Link>
            </Stack>
          </Box>

          <Box>
            <Typography variant="body2" fontWeight="bold" mb={2}>
              Resources
            </Typography>
            <Stack spacing={1}>
              <Link color="text.secondary" href="#blog">
                Blog
              </Link>
              <Link color="text.secondary" href="#guides">
                Guides
              </Link>
              <Link color="text.secondary" href="#tutorials">
                Tutorials
              </Link>
              <Link color="text.secondary" href="#faq">
                FAQ
              </Link>
            </Stack>
          </Box>

          <Box sx={{mr:"60px"}}>
            <Typography variant="body2" fontWeight="bold" mb={2}>
              Company
            </Typography>
            <Stack spacing={1}>
              <Link color="text.secondary" href="#about">
                About Us
              </Link>
              <Link color="text.secondary" href="#careers">
                Careers
              </Link>
              <Link color="text.secondary" href="#contact">
                Contact
              </Link>
              <Link color="text.secondary" href="#privacy">
                Privacy
              </Link>
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: { xs: 4, sm: 8 },
          width: "100%",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{
            color: "text.secondary",
          }}
        >
          <IconButton
            color="inherit"
            href="https://github.com/tetraPack-Org/Pose_Master"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            color="inherit"
            href="https://linkedin.com"
            aria-label="LinkedIn"
          >
            <LinkedInIcon />
          </IconButton>
        </Stack>
        <Copyright />
      </Box>
    </Container>
  );
}
