import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MentorForm from "./components/MentorForm";
import SignUp from "./pages/signup/SignUp";
import SignIn from "./pages/signin/SignIn";
import PoseComparison from "./components/PoseComparision";

// Material UI imports
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SendIcon from "@mui/icons-material/Send";
import InputAdornment from "@mui/material/InputAdornment";
import AppTheme from "./shared-theme/AppTheme";

const socket = io("http://localhost:4000", { withCredentials: true });

function App() {
  const [room, setRoom] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gallery, setGallery] = useState([]);
  const [authMode, setAuthMode] = useState("signin"); // 'signin' or 'signup'

  const fetchGallery = async () => {
    if (!room || !user) return;
    try {
      const params =
        role === "mentor"
          ? { roomId: room, mentor: user.userId }
          : { roomId: room };

      console.log(`Fetching gallery as ${role} with params:`, params);
      const res = await axios.get(
        "http://localhost:4000/api/upload/mentorforms/get",
        {
          params,
          withCredentials: true,
        }
      );
      console.log(`${role} received gallery data:`, res.data);
      setGallery(res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching gallery", error);
    }
  };

  useEffect(() => {
    if (inRoom) {
      fetchGallery();
    }
  }, [role, inRoom, room]);

  useEffect(() => {
    const handleGalleryUpdated = (updatedGallery) => {
      console.log("Received gallery update:", updatedGallery);
      console.log(
        "Gallery length:",
        updatedGallery ? updatedGallery.length : 0
      );
      console.log(
        "Gallery contents:",
        JSON.stringify(updatedGallery).substring(0, 200) + "..."
      );
      setGallery(updatedGallery);
    };

    const handleUpdateImage = (index) => {
      console.log("Received updateImage event:", index);
      setCurrentIndex(index);
    };

    socket.on("galleryUpdated", handleGalleryUpdated);
    socket.on("updateImage", handleUpdateImage);

    return () => {
      socket.off("galleryUpdated", handleGalleryUpdated);
      socket.off("updateImage", handleUpdateImage);
    };
  }, []);

  useEffect(() => {
    socket.on("message", (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get("http://localhost:4000/api/auth/me", {
          withCredentials: true,
        });
        setUser(res.data);
        setRole(res.data.role);
      } catch (error) {
        console.error("User not authenticated", error);
      }
    }
    fetchUser();
  }, []);

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
      alert("Signup failed: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLogin = async (username, password) => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/login",
        { username, password },
        { withCredentials: true }
      );
      const res = await axios.get("http://localhost:4000/api/auth/me", {
        withCredentials: true,
      });
      console.log("User logged in:", res.data);
      setUser(res.data);
      setRole(res.data.role);
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed: " + (error.response?.data?.message || error.message));
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

  const createRoom = () => {
    if (role !== "mentor") {
      alert("Only mentors can create rooms.");
      return;
    }
    socket.emit("createRoom", room);
    setInRoom(true);
  };

  const joinRoom = () => {
    socket.emit("joinRoom", room, async (currentImgIndex) => {
      if (currentImgIndex === null) {
        alert("Room does not exist");
        return;
      }
      setCurrentIndex(currentImgIndex);
      setInRoom(true);

      const data = await fetchGallery();

      if (role === "mentor" && data && data.length > 0) {
        console.log("Mentor emitting gallery on join:", data);
        socket.emit("galleryUpdated", data, room);
      }
    });
  };

  const sendMessage = () => {
    if (!message.trim()) return;

    const msgObj = { sender: user.username, text: message };
    socket.emit("message", msgObj);
    setMessages((prev) => [...prev, msgObj]);
    setMessage("");
  };

  const nextImage = () => {
    if (role === "mentor" && currentIndex < gallery.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      console.log("next image -> 3");
      socket.emit("updateImage", newIndex, room);
    }
  };

  const prevImage = () => {
    if (role === "mentor" && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      console.log("prev image -> 3");
      socket.emit("updateImage", newIndex, room);
    }
  };

  const refreshGallery = async (updatedGalleryData = null) => {
    if (role === "mentor") {
      if (updatedGalleryData) {
        setGallery(updatedGalleryData);
        socket.emit("galleryUpdated", updatedGalleryData, room);
      } else {
        const data = await fetchGallery();
        if (data) {
          setGallery(data);
          socket.emit("galleryUpdated", data, room);
        }
      }
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === "signin" ? "signup" : "signin");
  };

  return (
    <AppTheme>
      <Box sx={{ flexGrow: 1 }}>
        {!user ? (
          authMode === "signin" ? (
            <SignIn
              onLogin={handleLogin}
              onToggleToSignup={toggleAuthMode}
            />
          ) : (
            <SignUp
              onSignup={handleSignup}
              onToggleToLogin={toggleAuthMode}
            />
          )
        ) : (
          <>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                  Yoga Posture Detector - {user.username} ({role})
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                  Logout
                </Button>
              </Toolbar>
            </AppBar>

            <Container sx={{ mt: 4 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Room Controls
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Room ID"
                        variant="outlined"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                      />
                    </Grid>
                    <Grid item>
                      {role === "mentor" && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={createRoom}
                          sx={{ mr: 1 }}
                        >
                          Create Room
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={joinRoom}
                      >
                        Join Room
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {inRoom && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Chat
                        </Typography>
                        <Box
                          sx={{
                            maxHeight: 300,
                            overflowY: "auto",
                            mb: 2,
                            p: 2,
                            backgroundColor: "grey.100",
                            borderRadius: 1,
                          }}
                        >
                          {messages.map((msg, index) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 1,
                                p: 1,
                                borderRadius: 1,
                                backgroundColor:
                                  msg.sender === user.username
                                    ? "primary.light"
                                    : "background.paper",
                                alignSelf:
                                  msg.sender === user.username
                                    ? "flex-end"
                                    : "flex-start",
                                maxWidth: "80%",
                              }}
                            >
                              <Typography variant="subtitle2">
                                {msg.sender}
                              </Typography>
                              <Typography variant="body2">{msg.text}</Typography>
                            </Box>
                          ))}
                        </Box>
                        <TextField
                          fullWidth
                          label="Message"
                          variant="outlined"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  edge="end"
                                  color="primary"
                                  onClick={sendMessage}
                                >
                                  <SendIcon />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              sendMessage();
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Pose Comparison
                        </Typography>
                        <PoseComparison gallery={gallery} />
                      </CardContent>
                    </Card>

                    {role === "mentor" && gallery.length === 0 && (
                      <Card sx={{ mt: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Upload Yoga Posture
                          </Typography>
                          <MentorForm
                            roomId={room}
                            mentorId={user.userId}
                            onSubmission={refreshGallery}
                            socket={socket}
                          />
                        </CardContent>
                      </Card>
                    )}
                  </Grid>
                </Grid>
              )}
            </Container>
          </>
        )}
      </Box>
    </AppTheme>
  );
}

export default App;