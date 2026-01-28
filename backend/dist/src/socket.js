"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOnlineUsers = exports.getIO = exports.initSocket = void 0;
// src/socket.ts
const socket_io_1 = require("socket.io");
let io;
const onlineUsers = new Map();
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:3000",
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            onlineUsers.set(userId, socket.id);
        }
        socket.on("disconnect", () => {
            if (userId)
                onlineUsers.delete(userId);
            console.log(`disconnected`);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => io;
exports.getIO = getIO;
const getOnlineUsers = () => onlineUsers;
exports.getOnlineUsers = getOnlineUsers;
