import express = require("express");
import dotenv = require("dotenv");
import cors = require("cors"); 
import http from "http";
import { Server } from "socket.io";
import { initSocket, getIO, getOnlineUsers } from "./socket";
import skillRoutes from "./routes/skillRoutes";
import userRoutes from "./routes/userRoutes";
import bookSessionRoutes from "./routes/bookSessionRoutes";
import authRoutes from "./routes/authRoutes";
import learnerRoutes from "./routes/learnerRoutes";
import mentorRoutes from "./routes/mentorRoutes";
import profileRoutes from "./routes/profile.routes"
import connectionRoutes from "./routes/connectionRoutes"
import followRoutes from "./routes/followRoutes"
import meetSessionRoutes from './routes/meetSessionRoutes'
import googleAuthRoutes from "./routes/googleAuthRoutes";
import googleTokenRoutes from "./routes/googleTokenRoutes";
import filteredProfileRoutes from "./routes/filteredRoutes"
import AiSearchRoutes from "./routes/aiSearchQuery"

dotenv.config();

const app = express();

app.use(cors()); // ✅ Enable CORS for all origins
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/bookSession", bookSessionRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/api/learnersBooking", learnerRoutes);
app.use("/api/mentorBooking", mentorRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/filtered-profile", filteredProfileRoutes);

app.use("/api/connections", connectionRoutes);
app.use("/api/follow", followRoutes);

app.use("/api", connectionRoutes);

app.use("/aisearch", AiSearchRoutes)

app.use("/api/sessions", meetSessionRoutes)
// app.use("/api/sessions", meetSessionRoutes);

app.use("/api/google", googleAuthRoutes);
app.use("/api/google-token", googleTokenRoutes);

const server = http.createServer(app);
initSocket(server);

// The socket logic is already handled inside initSocket in ./socket.ts
// But if you want to keep additional logic here, use getIO()
const io = getIO();
const onlineUsers = getOnlineUsers();

// ✅ Export user map so you can use it elsewhere if needed
export { onlineUsers };
const PORT = process.env.PORT || 4500;

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
