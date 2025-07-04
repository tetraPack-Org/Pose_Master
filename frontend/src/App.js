import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import EnhancedMentorForm from "./components/EnhancedMentorForm";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AppTheme from "./shared-theme/AppTheme";
import LandingPage from "./pages/landing_page/LandingPage";
import LinearProgress from "@mui/material/LinearProgress";
import ProfileUpdateForm from "./components/ProfileUpdateForm";
import RoomControls from "./components/RoomControls";
import ChatBox from "./components/ChatBox";
import ImageGallery from "./components/ImageGallery";
import StudentProgress from "./components/StudentProgress";

const socket = io("http://localhost:4000/", {
  transports: ["websocket", "polling"], // Allow fallback to polling
  withCredentials: true,
  extraHeaders: {
    "Access-Control-Allow-Origin": "*",
  },
  cors: {
    origin: "http://localhost:4000/",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

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
  const [showHome, setShowHome] = useState(false);
  // Track student achievements
  const [achievedStudents, setAchievedStudents] = useState(new Set());
  const [userAchievements, setUserAchievements] = useState({});
  const [totalAchievements, setTotalAchievements] = useState(0);

  const buttonHandler = () => {
    setShowHome(true);
  };

  

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

  useEffect(() => {
    console.log("Achieved students:", achievedStudents);
  }, [achievedStudents]);

  useEffect(() => {
    socket.on("poseAchieved", (data) => {
      console.log("Received pose achievement:", data);
      if (role === "mentor") {
        setAchievedStudents((prev) => {
          const newSet = new Set(prev);
          newSet.add(data.userId);
          return newSet;
        });
      }
      // Track individual user achievements
      setUserAchievements((prev) => ({
        ...prev,
        [data.userId]: (prev[data.userId] || 0) + 1,
      }));
      setTotalAchievements((prev) => prev + 1);
    });

    return () => {
      socket.off("poseAchieved");
    };
  }, [role]);

  useEffect(() => {
    if (inRoom) {
      fetchGallery();
    }
  }, [role, inRoom, room]);

  useEffect(() => {

    socket.on("updateImage", (data) => {
      console.log("Received updateImage event:", data);
      if (data && typeof data.newIndex === "number") {
        setCurrentIndex(data.newIndex);
      }
    });

    socket.on("galleryUpdated", (updatedGallery) => {
      console.log("Received gallery update:", updatedGallery);
      setGallery(updatedGallery);
    });

    return () => {
      socket.off("galleryUpdated");
      socket.off("updateImage");
    };
  }, []);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await axios.get(
          "http://localhost:4000/api/auth/me",
          {
            withCredentials: true,
          }
        );
        setUser(res.data);
        setRole(res.data.role);
      } catch (error) {
        console.error("User not authenticated", error);
      }
    }
    fetchUser();
  }, []);

  
  

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
        socket.emit("galleryUpdated", { gallery: data, room });
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

  // Updated image navigation functions
  const nextImage = () => {
    if (role === "mentor" && currentIndex < gallery.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setAchievedStudents(new Set()); 
      socket.emit("updateImage", { newIndex, room });
    }
  };

  const prevImage = () => {
    if (role === "mentor" && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setAchievedStudents(new Set()); 
      socket.emit("updateImage", { newIndex, room });
    }
  };

  const refreshGallery = async (updatedGalleryData = null) => {
    if (role === "mentor") {
      if (updatedGalleryData) {
        setGallery(updatedGalleryData);
        socket.emit("galleryUpdated", { gallery: updatedGalleryData, room });
      } else {
        const data = await fetchGallery();
        if (data) {
          setGallery(data);
          socket.emit("galleryUpdated", { gallery: data, room });
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
          <>
            <LandingPage
              user={user}
              setUser={setUser}
              setRole={setRole}
              setShowHome={setShowHome}
              setInRoom={setInRoom}
              setRoom={setRoom}
              setMessages={setMessages}
            />
          </>
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
            <Button onClick={buttonHandler}>Home Page</Button>

            {role === "mentor" && (
              <StudentProgress achievedStudents={achievedStudents}></StudentProgress>
            )}

            <Container sx={{ mt: 4 }}>
              {/* Profile Update Section */}
                <ProfileUpdateForm user={user} />
              
              {/* Room Controls and Other Features */}
              <RoomControls room={room} setRoom={setRoom} createRoom={createRoom} joinRoom={joinRoom} role={role} />

              {inRoom && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                      <ChatBox messages={messages} message={message} setMessage={setMessage} setMessages={setMessages} sendMessage={sendMessage} user={user} socket={socket} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                      <ImageGallery gallery={gallery} currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} role={role} room={room} userId={user?.userId} nextImage={nextImage} prevImage={prevImage} socket={socket} refreshGallery={refreshGallery} />

                    {role === "mentor" && gallery.length === 0 && (
                      <Card sx={{ mt: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Upload Yoga Posture
                          </Typography>
                          <EnhancedMentorForm
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

        {showHome && user && (
          <LandingPage
            user={user}
            setUser={setUser}
            setRole={setRole}
            setShowHome={setShowHome}
            setInRoom={setInRoom}
            setRoom={setRoom}
            setMessages={setMessages}
          />
        )}
      </Box>
    </AppTheme>
  );
}

export default App;
