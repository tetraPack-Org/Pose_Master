import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import dbConnect from "./config/dbConnect.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import mentorFormRoutes from "./routes/mentorFormRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000", // your frontend origin
        credentials: true,
    })
);
app.use(cookieParser());

// dbConnect();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
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
        // Initialize current index for this room
        currentIndexByRoom[room] = 0;
        console.log(`Room ${room} created`);
    });

    socket.on("joinRoom", (room, callback) => {
        // Check if the room exists
        if (currentIndexByRoom[room] === undefined) {
            console.log(`Room ${room} does not exist`);
            return callback(null);
        }
        socket.join(room);
        console.log(`User joined room ${room}`);
        // Immediately send the current index via the callback.
        callback(currentIndexByRoom[room]);
    });

    socket.on("message", (message) => {
        // Broadcast message to everyone except the sender in the room(s)
        const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
        rooms.forEach((room) => {
            socket.to(room).emit("message", message);
        });
    });

    socket.on("updateImage", (newIndex) => {
        const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
        rooms.forEach((room) => {
            currentIndexByRoom[room] = newIndex;
            socket.to(room).emit("updateImage", newIndex);
        });
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});