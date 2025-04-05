import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AppTheme from "../../shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Hero from "./components/Hero";
import LogoCollection from "./components/LogoCollection";
import Highlights from "./components/Highlights";
import Pricing from "./components/Pricing";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import SignIn from "../signin/SignIn";
import SignUp from "../signup/SignUp";


export default function LandingPage({user, onLogin, onSignup , handleLogout}) {
  const [authMode, setAuthMode] = React.useState(null); // null, 'signin', or 'signup'

  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <React.Fragment>
        <Box
          sx={{
            display: authMode ? "none" : "block", // Hide landing page content when auth form is shown
          }}
          >
          <AppAppBar setAuthMode={setAuthMode}
          isLoggedIn={!!user}
          username={user?.username}
          onLogout={user ? handleLogout : undefined} />
          <Hero />
          <Features />
          <Divider />
          <Testimonials />
          <Divider />
          <Pricing />
          <Divider />
          <FAQ />
          <Footer />
        </Box>

        {/* Authentication Forms */}
        {authMode === "signin" && (
          <Container maxWidth="sm" sx={{ mt: 15, mb: 4 }}>
            <SignIn
              onLogin={onLogin}
              onToggleToSignup={() => setAuthMode("signup")}
            />
          </Container>
        )}
        {authMode === "signup" && (
          <Container maxWidth="sm" sx={{ mt: 15, mb: 4 }}>
            <SignUp
              onSignup={onSignup}
              onToggleToLogin={() => setAuthMode("signin")}
            />
          </Container>
        )}
      </React.Fragment>
    </AppTheme>
  );
}
