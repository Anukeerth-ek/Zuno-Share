"use client";

import { useEffect, useState } from "react";
import CreatePost from "@/components/community/CreatePost";
import PostCard from "@/components/community/PostCard";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
      id: string;
      name: string;
  };
  _count: {
    comments: number;
    votes: number;
  };
  userVote: number;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillFilter, setSkillFilter] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = skillFilter 
        ? `${process.env.NEXT_PUBLIC_API_URL}/posts/feed?skillId=${skillFilter}`
        : `${process.env.NEXT_PUBLIC_API_URL}/posts/feed`;
        
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [skillFilter]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar (Skills / Filters) - Hidden on mobile for now or collapsed */}
        <div className="hidden md:block col-span-1 space-y-4">
            <div className="p-4 bg-card border border-border rounded-xl sticky top-24">
                <h3 className="font-bold mb-4">Topics</h3>
                <Button 
                    variant={!skillFilter ? "secondary" : "ghost"} 
                    className="w-full justify-start mb-2"
                    onClick={() => setSkillFilter(null)}
                >
                    All Posts
                </Button>
                {/* 
                  TODO: Fetch top skills from API. 
                  For now hardcoded common ones as placeholder or remove if dynamic list is needed later 
                */}
                {/* <div className="text-sm text-muted-foreground">Select a skill to filter</div> */}
            </div>
        </div>

        {/* Feed */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          <CreatePost onPostCreated={fetchPosts} />

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No posts yet. Be the first to share something!
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
