"use strict";
// src/controllers/connectionController.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserConnections = exports.getAcceptedConnections = exports.getIncomingRequests = exports.declineConnectionRequest = exports.acceptConnectionRequest = exports.sendConnectionRequest = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const socket_1 = require("../socket");
const io = (0, socket_1.getIO)();
const onlineUsers = (0, socket_1.getOnlineUsers)();
const sendConnectionRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { senderId, receiverId } = req.body;
    if (senderId === receiverId) {
        res.status(400).json({ message: "Cannot connect with yourself" });
        return;
    }
    try {
        const existing = yield prisma_1.default.connection.findFirst({
            where: {
                senderId,
                receiverId,
            },
        });
        if (existing) {
            res.status(400).json({ message: "Connection request already exists" });
            return;
        }
        const connection = yield prisma_1.default.connection.create({
            data: {
                senderId,
                receiverId,
                status: "PENDING",
            },
        });
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("connection:request", connection);
        }
        res.status(201).json(connection);
    }
    catch (error) {
        console.error("Send connection error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.sendConnectionRequest = sendConnectionRequest;
const acceptConnectionRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { connectionId } = req.body;
    try {
        const updated = yield prisma_1.default.connection.update({
            where: { id: connectionId },
            data: { status: "ACCEPTED" },
        });
        const senderSocketId = onlineUsers.get(updated.senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("connection:accepted", updated);
        }
        res.status(200).json(updated);
    }
    catch (error) {
        console.error("Accept connection error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.acceptConnectionRequest = acceptConnectionRequest;
const declineConnectionRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { connectionId } = req.body;
    try {
        const declined = yield prisma_1.default.connection.update({
            where: { id: connectionId },
            data: { status: "DECLINED" },
        });
        res.status(200).json(declined);
    }
    catch (error) {
        console.error("Decline connection error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.declineConnectionRequest = declineConnectionRequest;
const getIncomingRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId; // or get from token
    try {
        const requests = yield prisma_1.default.connection.findMany({
            where: {
                receiverId: userId,
                status: "PENDING",
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        res.status(200).json(requests);
    }
    catch (error) {
        console.error("Get incoming requests error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getIncomingRequests = getIncomingRequests;
const getAcceptedConnections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const connections = yield prisma_1.default.connection.findMany({
            where: {
                status: "ACCEPTED",
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        res.status(200).json(connections);
    }
    catch (error) {
        console.error("Get accepted connections error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAcceptedConnections = getAcceptedConnections;
// Get all accepted connections for a user (only the other user's details)
const getUserConnections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const connections = yield prisma_1.default.connection.findMany({
            where: {
                status: "ACCEPTED",
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                        skillsOffered: true,
                        skillsWanted: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        // Map to return only the "other user" in each connection
        const formatted = connections.map((conn) => {
            const isSender = conn.senderId === userId;
            const otherUser = isSender ? conn.receiver : conn.sender;
            return {
                id: conn.id,
                user: otherUser,
                connectedAt: conn.createdAt, // optional: when accepted
            };
        });
        res.status(200).json({ connections: formatted });
    }
    catch (error) {
        console.error("Get user connections error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUserConnections = getUserConnections;
