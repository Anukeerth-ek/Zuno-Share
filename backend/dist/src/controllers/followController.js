"use strict";
// src/controllers/followController.ts
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
exports.followUser = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const socket_1 = require("../socket");
const io = (0, socket_1.getIO)();
const onlineUsers = (0, socket_1.getOnlineUsers)();
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { followerId, followingId } = req.body;
    if (followerId === followingId) {
        res.status(400).json({ message: "Cannot follow yourself" });
        return;
    }
    try {
        const existing = yield prisma_1.default.follow.findFirst({
            where: { followerId, followingId },
        });
        if (existing) {
            res.status(400).json({ message: "Already following this user" });
            return;
        }
        const follow = yield prisma_1.default.follow.create({
            data: {
                followerId,
                followingId,
            },
        });
        const followingSocketId = onlineUsers.get(followingId);
        if (followingSocketId) {
            io.to(followingSocketId).emit("follow:received", follow);
        }
        res.status(201).json(follow);
    }
    catch (error) {
        console.error("Follow error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.followUser = followUser;
