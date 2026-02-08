import express from "express";
import { createPost, getFeed, votePost, createComment, getComments, getPostById, deletePost } from "../controllers/postController";
import { authenticateUser, optionalAuthenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateUser, createPost);
router.get("/", optionalAuthenticateUser, getFeed);
router.get("/:id", optionalAuthenticateUser, getPostById);
router.delete("/:id", authenticateUser, deletePost);

router.post("/:postId/vote", authenticateUser, votePost);

router.post("/:postId/comments", authenticateUser, createComment);
router.get("/:postId/comments", authenticateUser, getComments);

export default router;
