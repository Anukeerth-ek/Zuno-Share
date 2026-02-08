"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

interface CreatePostProps {
  onPostCreated: () => void;
}

interface Skill {
    id: string;
    name: string;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [skillId, setSkillId] = useState("");
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);

  // TODO: Fetch Skills. For MVP we need generic or existing skills.
  // Ideally this should come from context or generic fetch.
  useEffect(() => {
      // Mocking fetch skills or real fetch
      const fetchSkills = async () => {
          try {
             // Assuming we have a public or auth route to get skills
             const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/skills`);
             if(res.ok) {
                 const data = await res.json();
                 setSkills(data);
             }
          } catch(e) {
              console.error(e);
          }
      }
      fetchSkills();
  }, [])


  const handleSubmit = async () => {
    if (!title || !content || !skillId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, skillId }),
      });

      if (res.ok) {
        setTitle("");
        setContent("");
        setSkillId("");
        setIsOpen(false);
        onPostCreated();
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Card className="mb-6 cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setIsOpen(true)}>
        <CardContent className="p-4 flex items-center gap-3">
          <Avatar>
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="flex-1 bg-secondary/50 rounded-full px-4 py-2 text-muted-foreground text-sm">
            Start a discussion...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 animate-in fade-in slide-in-from-top-2">
      <CardContent className="p-4 space-y-4">
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-semibold text-lg border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/70"
        />
        <Textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[100px] resize-none border-none px-0 focus-visible:ring-0"
        />
        
        <div className="flex items-center justify-between border-t pt-4">
            <Select value={skillId} onValueChange={setSkillId}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Topic" />
                </SelectTrigger>
                <SelectContent>
                    {skills.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                    {skills.length === 0 && <SelectItem value="loading" disabled>Loading skills...</SelectItem>}
                </SelectContent>
            </Select>

            <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={!title || !content || !skillId || loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Post
                </Button>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
