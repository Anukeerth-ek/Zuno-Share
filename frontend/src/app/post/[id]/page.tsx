"use client";

import { useEffect, useState, use } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
    replies: Comment[];
    _count: {
        votes: number;
    }
}

interface Post {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        avatarUrl: string | null;
    };
    skill: {
        name: string;
    };
    _count: {
        comments: number;
        votes: number;
    };
    userVote: number;
}


// Recursive Comment Component
const CommentItem = ({ comment, postId, onReply }: { comment: Comment, postId: string, onReply: () => void }) => {
    return (
        <div className="border-l-2 border-border pl-4 mt-4">
             <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={comment.author.avatarUrl || ""} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{comment.author.name}</span>
                <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
            </div>
            <p className="text-sm mb-2">{comment.content}</p>
            
            {/* Action bar for comment (Reply/Vote) could go here */}
            {/* For MVP, just displaying replies recursively */}
            
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map(reply => (
                        <CommentItem key={reply.id} comment={reply} postId={postId} onReply={onReply} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function PostDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrap params using React.use()
    const { id } = use(params);
    const router = useRouter();
    
    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null); // To check ownership

    useEffect(() => {
        // Fetch User (hacky way to get ID, ideally from context)
        // Ignoring for now, relying on errors or UI state if needed.
    }, []);

    const fetchPostAndComments = async () => {
        setLoading(true);
        try {
             const token = localStorage.getItem("token");
             const headers = { Authorization: `Bearer ${token}` };

             const [postRes, commentsRes] = await Promise.all([
                 fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`, { headers }),
                 fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments`, { headers })
             ]);

             if (postRes.ok) {
                 setPost(await postRes.json());
             } else {
                 // Handle 404
                 console.error("Post not found");
             }

             if (commentsRes.ok) {
                 setComments(await commentsRes.json());
             }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPostAndComments();
    }, [id]);

    const handleVote = async (value: number) => {
        if (!post) return;
        // Optimistic update
        const previousVote = post.userVote;
        const newVote = previousVote === value ? 0 : value;
        
        // Calculate optimistic score change
        let scoreChange = 0;
        if (previousVote === 0) scoreChange = newVote; // 0 -> 1 (+1), 0 -> -1 (-1)
        else if (previousVote === 1 && newVote === 0) scoreChange = -1; // 1 -> 0
        else if (previousVote === -1 && newVote === 0) scoreChange = 1; // -1 -> 0
        else if (previousVote === 1 && newVote === -1) scoreChange = -2; // 1 -> -1
        else if (previousVote === -1 && newVote === 1) scoreChange = 2; // -1 -> 1

        setPost(prev => prev ? ({
            ...prev,
            userVote: newVote,
            _count: {
                ...prev._count,
                votes: prev._count.votes + scoreChange
            }
        }) : null);

        try {
            const token = localStorage.getItem("token");
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/vote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ value: newVote === 0 ? value : newVote }) 
            });
        } catch (e) {
            console.error(e);
            // Revert on error?
        }
    }

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ content: newComment })
            });

            if (res.ok) {
                setNewComment("");
                // Refresh comments
                const commentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (commentsRes.ok) {
                    setComments(await commentsRes.json());
                }
                // Update comment count
                setPost(prev => prev ? ({
                    ...prev,
                    _count: {
                        ...prev._count,
                        comments: prev._count.comments + 1
                    }
                }) : null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    if (!post) {
        return <div className="pt-20 text-center">Post not found</div>
    }

    return (
        <div className="min-h-screen bg-background pb-20 pt-20">
            <div className="max-w-3xl mx-auto px-4">
                <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent hover:underline" onClick={() => router.back()}>
                    &larr; Back to Feed
                </Button>

                <div className="flex">
                     {/* Vote Sidebar */}
                    <div className="flex flex-col items-center mr-4 gap-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${post.userVote === 1 ? 'text-primary' : 'text-muted-foreground'}`}
                            onClick={() => handleVote(1)}
                        >
                            <ArrowBigUp className={`w-8 h-8 ${post.userVote === 1 ? 'fill-current' : ''}`} />
                        </Button>
                        
                        <span className="text-lg font-bold text-muted-foreground">
                            {post._count.votes}  
                        </span>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${post.userVote === -1 ? 'text-destructive' : 'text-muted-foreground'}`}
                            onClick={() => handleVote(-1)}
                        >
                            <ArrowBigDown className={`w-8 h-8 ${post.userVote === -1 ? 'fill-current' : ''}`} />
                        </Button>
                    </div>

                    <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={post.author.avatarUrl || ""} />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{post.author.name}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                            <span>•</span>
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium">
                                {post.skill.name}
                            </span>
                        </div>

                        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
                        <p className="text-lg whitespace-pre-wrap mb-8 text-foreground/90 leading-relaxed">
                            {post.content}
                        </p>

                        <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5" />
                                {post._count.comments} Comments
                            </h3>

                            <div className="mb-8 flex gap-4">
                                <Textarea 
                                    placeholder="Add to the discussion..." 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="resize-none"
                                />
                                <Button className="self-end" onClick={handleCommentSubmit} disabled={!newComment || submitting}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {comments.map(comment => (
                                    <CommentItem key={comment.id} comment={comment} postId={post.id} onReply={() => {}} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
