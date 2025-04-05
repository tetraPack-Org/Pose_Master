import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import img1 from "./assets/yoga-1.webp";
import img2 from "./assets/yoga-2.webp";
import img3 from "./assets/yoga-3.webp";
import img4 from "./assets/yoga-4.webp";
import img5 from "./assets/yoga-5.webp";
import MentorForm from "./components/MentorForm";

const socket = io("http://localhost:4000", { withCredentials: true });
const images = [img1, img2, img3, img4, img5];

function App() {
  const [room, setRoom] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null); // Expected user object includes _id
  const [role, setRole] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    socket.on("message", (msgObj) => {
      setMessages((prev) => [...prev, msgObj]);
    });
    socket.on("updateImage", (newIndex) => {
      setCurrentIndex(newIndex);
    });
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

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  const handleSignup = async (username, password, role) => {
    try {
      const res = await axios.post(
        "http://localhost:4000/api/auth/signup",
        { username, password, role },
        { withCredentials: true }
      );
      alert("Signup successful, please login");
    } catch (error) {
      console.error("Signup failed", error);
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
    }
  };

  // Logout handler that clears the cookie on the server and resets the UI.
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:4000/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      setRole(null);
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
    socket.emit("joinRoom", room, (currentImgIndex) => {
      if (currentImgIndex === null) {
        alert("Room does not exist");
        return;
      }
      setCurrentIndex(currentImgIndex);
      setInRoom(true);
    });
  };

  const sendMessage = () => {
    const msgObj = { sender: user.username, text: message };
    socket.emit("message", msgObj);
    setMessages((prev) => [...prev, msgObj]);
    setMessage("");
  };

  const nextImage = () => {
    if (role === "mentor" && currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      socket.emit("updateImage", newIndex);
    }
  };

  const prevImage = () => {
    if (role === "mentor" && currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      socket.emit("updateImage", newIndex);
    }
  };

  return (
    <div className="App">
      {!user ? (
        <div>
          <h2>Login</h2>
          <input type="text" placeholder="Username" id="login-username" />
          <input type="password" placeholder="Password" id="login-password" />
          <button
            onClick={() =>
              handleLogin(
                document.getElementById("login-username").value,
                document.getElementById("login-password").value
              )
            }
          >
            Login
          </button>
          <h2>Signup</h2>
          <input type="text" placeholder="Username" id="signup-username" />
          <input type="password" placeholder="Password" id="signup-password" />
          <select id="signup-role">
            <option value="mentor">Mentor</option>
            <option value="mentee">Mentee</option>
          </select>
          <button
            onClick={() =>
              handleSignup(
                document.getElementById("signup-username").value,
                document.getElementById("signup-password").value,
                document.getElementById("signup-role").value
              )
            }
          >
            Signup
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h2>
              Welcome, {user.username} ({role})
            </h2>
            {/* Logout button visible when a user is logged in */}
            <button onClick={handleLogout}>Logout</button>
          </div>
          <input
            type="text"
            placeholder="Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          {role === "mentor" && <button onClick={createRoom}>Create Room</button>}
          <button onClick={joinRoom}>Join Room</button>

          {inRoom && (
            <>
              <input
                type="text"
                placeholder="Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>

              <div>
                <h3>Chat Messages</h3>
                {messages.map((msg, index) => (
                  <p key={index}>
                    <strong>{msg.sender}:</strong> {msg.text}
                  </p>
                ))}
              </div>

              <div>
                <h3>Image Gallery Carousel</h3>
                <div
                  className="carousel"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  {role === "mentor" ? (
                    <>
                      <button onClick={prevImage}>Prev</button>
                      <img
                        src={images[currentIndex]}
                        alt={`yoga-${currentIndex + 1}`}
                        width="150"
                        style={{ margin: "0 10px" }}
                      />
                      <button onClick={nextImage}>Next</button>
                    </>
                  ) : (
                    <img
                      src={images[currentIndex]}
                      alt={`yoga-${currentIndex + 1}`}
                      width="150"
                      style={{ margin: "0 10px" }}
                    />
                  )}
                </div>
              </div>
              {role === "mentor" && (
                <div>
                  <MentorForm roomId={room} mentorId={user._id} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
