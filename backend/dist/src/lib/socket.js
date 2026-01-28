"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineUsers = exports.io = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:3000", // adjust this if frontend URL differs
        credentials: true,
    },
});
exports.io = io;
// Track connected users
const onlineUsers = new Map(); // userId -> socket.id
exports.onlineUsers = onlineUsers;
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        onlineUsers.set(userId, socket.id);
    }
    socket.on("disconnect", () => {
        if (userId)
            onlineUsers.delete(userId);
        console.log(` disconnected`);
    });
});
exports.default = server;
