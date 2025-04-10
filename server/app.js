import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import dbConnect from "./config/dbConnect.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import fileUpload from "express-fileupload";
import mentorFormRoutes from "./routes/mentorFormRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "https://fit-align-fy6z0rc9d-abhiram162105s-projects.vercel.app/", // your frontend origin
    credentials: true,
  })
);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    debug: true,
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // Enable debugging to see more information
  })
);

dbConnect();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://fit-align-fy6z0rc9d-abhiram162105s-projects.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Object to keep track of the current image index for each room
const currentIndexByRoom = {};

app.use("/api/auth", authRoutes);
app.use("/api/upload/mentorforms", mentorFormRoutes);

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.on("createRoom", (room) => {
    socket.join(room);
    currentIndexByRoom[room] = 0;
    console.log(`Room ${room} created`);
  });

  socket.on("poseAchieved", ({ room, userId }) => {
    console.log("Server received pose achievement:", { room, userId });
    io.to(room).emit("poseAchieved", { userId });
  });

  socket.on("joinRoom", (room, callback) => {
    if (currentIndexByRoom[room] === undefined) {
      console.log(`Room ${room} does not exist`);
      return callback(null);
    }
    socket.join(room);
    console.log(`User joined room ${room}`);
    callback(currentIndexByRoom[room]);
  });

  socket.on("message", (message) => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    rooms.forEach((room) => {
      socket.to(room).emit("message", message);
    });
  });

  socket.on("galleryUpdated", (galleryData, room) => {
    console.log("2 -> Gallery updated for room:", room);
    io.in(room).emit("galleryUpdated", galleryData);
  });

  // Replace the existing updateImage handler
  socket.on("updateImage", (data) => {
    console.log("Received updateImage event on server:", data);
    const { newIndex, room } = data;
    // Update index for room
    currentIndexByRoom[room] = newIndex;
    // Broadcast to ALL clients in the room (including sender)
    io.to(room).emit("updateImage", { newIndex });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
