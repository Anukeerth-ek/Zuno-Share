"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = void 0;
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http_1 = __importDefault(require("http"));
const socket_1 = require("./socket");
const skillRoutes_1 = __importDefault(require("./routes/skillRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const bookSessionRoutes_1 = __importDefault(require("./routes/bookSessionRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const learnerRoutes_1 = __importDefault(require("./routes/learnerRoutes"));
const mentorRoutes_1 = __importDefault(require("./routes/mentorRoutes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const connectionRoutes_1 = __importDefault(require("./routes/connectionRoutes"));
const followRoutes_1 = __importDefault(require("./routes/followRoutes"));
const meetSessionRoutes_1 = __importDefault(require("./routes/meetSessionRoutes"));
const googleAuthRoutes_1 = __importDefault(require("./routes/googleAuthRoutes"));
const googleTokenRoutes_1 = __importDefault(require("./routes/googleTokenRoutes"));
const filteredRoutes_1 = __importDefault(require("./routes/filteredRoutes"));
const aiSearchQuery_1 = __importDefault(require("./routes/aiSearchQuery"));
dotenv.config();
const app = express();
app.use(cors()); // ✅ Enable CORS for all origins
app.use(express.json());
app.use("/api/auth", authRoutes_1.default);
app.use("/api/skills", skillRoutes_1.default);
app.use("/api/bookSession", bookSessionRoutes_1.default);
app.use("/api/profile", userRoutes_1.default);
app.use("/api/profiles", profile_routes_1.default);
app.use("/api/learnersBooking", learnerRoutes_1.default);
app.use("/api/mentorBooking", mentorRoutes_1.default);
app.use("/api/profile", profile_routes_1.default);
app.use("/api/filtered-profile", filteredRoutes_1.default);
app.use("/api/connections", connectionRoutes_1.default);
app.use("/api/follow", followRoutes_1.default);
app.use("/api", connectionRoutes_1.default);
app.use("/aisearch", aiSearchQuery_1.default);
app.use("/api/sessions", meetSessionRoutes_1.default);
// app.use("/api/sessions", meetSessionRoutes);
app.use("/api/google", googleAuthRoutes_1.default);
app.use("/api/google-token", googleTokenRoutes_1.default);
const server = http_1.default.createServer(app);
(0, socket_1.initSocket)(server);
// The socket logic is already handled inside initSocket in ./socket.ts
// But if you want to keep additional logic here, use getIO()
const io = (0, socket_1.getIO)();
const onlineUsers = (0, socket_1.getOnlineUsers)();
exports.onlineUsers = onlineUsers;
const PORT = process.env.PORT || 4500;
server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
