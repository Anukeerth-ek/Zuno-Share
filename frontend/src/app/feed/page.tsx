"use client";

import { useEffect, useState } from "react";
import CreatePost from "@/components/community/CreatePost";
import PostCard from "@/components/community/PostCard";
import { Loader2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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

interface Skill {
    id: string;
    name: string;
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string>("all");

  const fetchSkills = async () => {
      try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
          const res = await fetch(`${apiUrl}/api/skills`);
          if (res.ok) {
              setSkills(await res.json());
          }
      } catch (e) {
          console.error("Error fetching skills:", e);
      }
  };

  const fetchPosts = async (currentPage: number, skillId?: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const skillQuery = skillId && skillId !== "all" ? `&skillId=${skillId}` : "";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/posts?page=${currentPage}&limit=10${skillQuery}`, {
          headers: {
              Authorization: `Bearer ${token}`
          }
      });
      if (res.ok) {
        const data = await res.json();
        if (currentPage === 1) {
            setPosts(data.posts);
        } else {
            setPosts(prev => [...prev, ...data.posts]);
        }
        setHasMore(data.currentPage < data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchPosts(1, selectedSkill);
  }, []);

  // Effect to refetch when filter changes
  useEffect(() => {
      if (selectedSkill) {
          setPage(1);
          setPosts([]); // Clear previous posts to avoid weird mixing
          fetchPosts(1, selectedSkill);
      }
  }, [selectedSkill]);

  const handlePostCreated = () => {
      setPage(1);
      fetchPosts(1, selectedSkill); 
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-2xl mx-auto pt-20 px-4">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Community Feed</h1>
            
            <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Topic" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Topics</SelectItem>
                        {skills.map(skill => (
                            <SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        <CreatePost onPostCreated={handlePostCreated} />

        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {loading && (
            <div className="flex justify-center p-4">
                <Loader2 className="animate-spin text-primary" />
            </div>
        )}

        {!loading && hasMore && (
             <div className="flex justify-center p-4">
                <button onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchPosts(nextPage, selectedSkill);
                }} className="text-sm text-muted-foreground hover:text-primary">
                    Load More
                </button>
             </div>
        )}
        
        {!loading && !hasMore && posts.length > 0 && (
            <div className="text-center text-muted-foreground p-4">
                You've reached the end!
            </div>
        )}

        {!loading && posts.length === 0 && (
            <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
                No posts found for this topic. Be the first to start a discussion!
            </div>
        )}
      </div>
    </div>
  );
}
