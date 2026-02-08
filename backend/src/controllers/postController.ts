import { Request, Response } from "express";
import prisma from "../prismaClient";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, skillId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!title || !content || !skillId) {
       res.status(400).json({ message: "Title, content, and skillId are required" });
       return;
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        skillId,
        authorId: userId,
      },
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Error creating post" });
  }
};

    export const getFeed = async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { skillId, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const posts = await prisma.post.findMany({
          where: skillId ? { skillId: String(skillId) } : {},
          orderBy: { createdAt: "desc" },
          take: Number(limit),
          skip: skip,
          include: {
            author: {
              select: { id: true, name: true, avatarUrl: true },
            },
            skill: {
                select: { id: true, name: true }
            },
            _count: {
              select: { comments: true, votes: true },
            },
            votes: {
                where: { userId: req.user?.id || "" }, 
                select: { value: true }
            }
          },
        });

        const totalPosts = await prisma.post.count({
            where: skillId ? { skillId: String(skillId) } : {},
        });

        const feed = posts.map(post => {
            const userVote = post.votes[0]?.value || 0;
            return {
                ...post,
                userVote
            }
        });

        res.status(200).json({
            posts: feed,
            totalPages: Math.ceil(totalPosts / Number(limit)),
            currentPage: Number(page)
        });
      } catch (error) {
        console.error("Error fetching feed:", error);
        res.status(500).json({ message: "Error fetching feed" });
      }
    };

    export const getPostById = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    author: { select: { id: true, name: true, avatarUrl: true } },
                    skill: { select: { id: true, name: true } },
                    _count: { select: { comments: true, votes: true } },
                    votes: {
                        where: { userId: req.user?.id || "" },
                        select: { value: true }
                    }
                }
            });

            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            const userVote = post.votes[0]?.value || 0;
            res.status(200).json({ ...post, userVote });
        } catch (error) {
            console.error("Error fetching post:", error);
            res.status(500).json({ message: "Error fetching post" });
        }
    };

    export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            const post = await prisma.post.findUnique({ where: { id } });

            if (!post) {
                res.status(404).json({ message: "Post not found" });
                return;
            }

            if (post.authorId !== userId) {
                res.status(403).json({ message: "Unauthorized to delete this post" });
                return;
            }

            await prisma.post.delete({ where: { id } });
            res.status(200).json({ message: "Post deleted successfully" });
        } catch (error) {
            console.error("Error deleting post:", error);
            res.status(500).json({ message: "Error deleting post" });
        }
    };

    export const votePost = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { postId } = req.params;
            const { value } = req.body; // 1 (upvote) or -1 (downvote)
            const userId = req.user?.id;
    
            if (!userId) {
                 res.status(401).json({ message: "Unauthorized" });
                 return;
            }
    
            const existingVote = await prisma.vote.findFirst({
                where: {
                    userId,
                    postId,
                    commentId: null
                }
            });
    
            if (existingVote) {
                if (existingVote.value === value) {
                    // Toggle off (remove vote)
                    await prisma.vote.delete({ where: { id: existingVote.id } });
                } else {
                    // Change vote
                    await prisma.vote.update({
                        where: { id: existingVote.id },
                        data: { value }
                    });
                }
            } else {
                // New vote
                await prisma.vote.create({
                    data: {
                        userId,
                        postId,
                        value,
                        commentId: null 
                    }
                });
            }
    
            res.status(200).json({ success: true });
        } catch (error) {
            console.error("Error voting:", error);
            res.status(500).json({ message: "Error voting" });
        }
    }

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        const { content, parentId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
             res.status(401).json({ message: "Unauthorized" });
             return;
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                authorId: userId,
                parentId: parentId || null
            },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true }}
            }
        });
        
        res.status(201).json(comment);

    } catch (error) {
        console.error("Error commenting:", error);
        res.status(500).json({ message: "Error commenting" });
    }
}

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { postId } = req.params;
        
        // Fetch top-level comments
        const comments = await prisma.comment.findMany({
            where: { postId, parentId: null },
            include: {
                author: { select: { id: true, name: true, avatarUrl: true }},
                replies: {
                    include: {
                        author: { select: { id: true, name: true, avatarUrl: true }}
                    }
                },
                _count: { select: { votes: true }}
            },
            orderBy: { createdAt: "desc" }
        });
        
        res.status(200).json(comments);

    } catch (error) {
         console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Error fetching comments" });
    }
}
