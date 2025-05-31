import * as React from "react";
import axios from "axios";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import AppTheme from "../../shared-theme/AppTheme";
import AppAppBar from "./components/AppAppBar";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import Features from "./components/Features";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import SignIn from "../signin/SignIn";
import SignUp from "../signup/SignUp";

export default function LandingPage({ user, setUser, setRole, setShowHome, setInRoom, setRoom, setMessages }) {
  const [authMode, setAuthMode] = React.useState(null); // null, 'signin', or 'signup'

  const handleSignup = async (username, password, role) => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/signup",
        { username, password, role },
        { withCredentials: true }
      );
      alert("Signup successful, please login");
      setAuthMode("signin");
    } catch (error) {
      console.error("Signup failed", error);
      alert(
        "Signup failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleLogin = async (username, password) => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/login",
        { username, password },
        { withCredentials: true }
      );
      const res = await axios.get(
        "http://localhost:4000/api/auth/me",
        {
          withCredentials: true,
        }
      );
      console.log("User logged in:", res.data);
      setUser(res.data);
      setRole(res.data.role);
      setShowHome(false); // Hide landing page after login
    } catch (error) {
      console.error("Login failed", error);
      alert(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      setRole(null);
      setInRoom(false);
      setRoom("");
      setMessages([]);
      alert("Logged out successfully");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };



  return (
    <AppTheme>
      <CssBaseline enableColorScheme />
      <React.Fragment>
        <Box
          sx={{
            display: authMode ? "none" : "block", // Hide landing page content when auth form is shown
          }}
        >
          <AppAppBar
            setAuthMode={setAuthMode}
            isLoggedIn={!!user}
            username={user?.username}
            onLogout={user ? handleLogout : undefined}
          />
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
              onLogin={handleLogin}
              onToggleToSignup={() => setAuthMode("signup")}
            />
          </Container>
        )}
        {authMode === "signup" && (
          <Container maxWidth="sm" sx={{ mt: 15, mb: 4 }}>
            <SignUp
              onSignup={handleSignup}
              onToggleToLogin={() => setAuthMode("signin")}
            />
          </Container>
        )}
      </React.Fragment>
    </AppTheme>
  );
}
