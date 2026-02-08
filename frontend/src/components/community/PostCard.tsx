"use client";


import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MessageSquare, ArrowBigUp, ArrowBigDown } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

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

export default function PostCard({ post }: { post: Post }) {
  const [vote, setVote] = useState(post.userVote); // 0, 1, -1
  // We should ideally track the score locally too for optimistic UI, but simplistic for now
  // Assuming _count.votes is just raw count of records? No, typical schema `votes` is relation.
  // In our controller we returned _count.votes which is just number of total vote records (up + down presumably).
  // Actually, simplified score display for now.

  const handleVote = async (value: number) => {
    // Optimistic update
    const newVote = vote === value ? 0 : value;
    setVote(newVote);

    try {
        const token = localStorage.getItem("token");
         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${post.id}/vote`, {
            method: "POST",
            headers: {
                 "Content-Type": "application/json",
                 Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ value: newVote === 0 ? value : newVote }) // If toggling off, schema logic is deletion. 
            // My controller logic: sending same value deletes it. sending new value updates it.
            // So if newVote is 0, we need to send the OLD value to trigger deletion? Or API handles "0" as delete?
            // Controller: "if existingVote.value === value ... delete"
            // So if I send '1' and already have '1', it deletes.
            // So I should send `value`. 
        });
    } catch (e) {
        console.error(e);
        setVote(vote); // Revert
    }
  };

  return (
    <Card className="hover:border-primary/20 transition-colors">
      <div className="flex">
        {/* Vote Sidebar */}
        <div className="flex flex-col items-center p-3 bg-secondary/10 border-r border-border/50 w-12 gap-1">
             <Button 
                variant="ghost" 
                size="icon" 
                className={`h-8 w-8 ${vote === 1 ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => handleVote(1)}
            >
                 <ArrowBigUp className={`w-6 h-6 ${vote === 1 ? 'fill-current' : ''}`} />
             </Button>
             
             {/* Score placeholder - ideally calculated from backend properly */}
             <span className="text-sm font-bold text-muted-foreground">
                 {post._count.votes}  
             </span>

             <Button 
                variant="ghost" 
                size="icon" 
                 className={`h-8 w-8 ${vote === -1 ? 'text-destructive' : 'text-muted-foreground'}`}
                 onClick={() => handleVote(-1)}
            >
                 <ArrowBigDown className={`w-6 h-6 ${vote === -1 ? 'fill-current' : ''}`} />
             </Button>
        </div>



        <div className="flex-1">
            <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={post.author.avatarUrl || ""} />
                        <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                        Posted by <span className="font-medium text-foreground">{post.author.name}</span> • {formatDistanceToNow(new Date(post.createdAt))} ago
                    </span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-medium">
                        {post.skill.name}
                    </span>
                </div>
                <Link href={`/post/${post.id}`} className="hover:underline">
                    <h3 className="text-lg font-bold leading-tight">{post.title}</h3>
                </Link>
            </CardHeader>
            <CardContent className="p-4 pt-1">
                <Link href={`/post/${post.id}`}>
                    <p className="text-muted-foreground text-sm line-clamp-3 cursor-pointer hover:text-foreground/80 transition-colors">
                        {post.content}
                    </p>
                </Link>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button variant="ghost" size="sm" className="text-muted-foreground gap-2 h-8 px-2">
                    <MessageSquare className="w-4 h-4" />
                    {post._count.comments} Comments
                </Button>
            </CardFooter>
        </div>
      </div>
    </Card>
  );
}
