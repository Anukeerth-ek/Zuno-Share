// src/controllers/followController.ts

import { Request, Response } from "express";
import prisma from "../lib/prisma";
import { getIO, getOnlineUsers } from "../socket";
const io = getIO();
const onlineUsers = getOnlineUsers();

export const followUser = async (req: Request, res: Response) => {
  const { followerId, followingId } = req.body;

  if (followerId === followingId)
   {
       res.status(400).json({ message: "Cannot follow yourself" });
       return
   }

  try {
    const existing = await prisma.follow.findFirst({
      where: { followerId, followingId },
    });

    if (existing) {
      res.status(400).json({ message: "Already following this user" });
      return 
    }

    const follow = await prisma.follow.create({
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
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
