"use client";

import { MessageCircleMore, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Session {
     id: string;
     mentor: { name: string };
     learner: { name: string };
     skill: { name: string };
     status: "PENDING" | "CONFIRMED" | "REJECTED";
     scheduledAt: string;
     meetLink?: string;
}

export default function SessionDetail() {
     const [session, setSession] = useState<Session | null>(null);
     const router = useRouter()

     useEffect(() => {
          const saved = localStorage.getItem("selectedSession");
          if (saved) {
               setSession(JSON.parse(saved));
          }
     }, []);
     if (!session) return <p>Loading session...</p>;

  const handleGotoRoadmap = () => {
    router.push(`/frontend/sessions/${session.id}/roadmap`)
  }
  const handleGotoChat = () => {
    router.push(`/frontend/chat`)
  }
  
     return (
          <div className="max-w-3xl mx-auto p-6">
               <h1 className="text-2xl font-bold mb-4">Session Details</h1>
               <div className="space-y-3 border p-4 rounded-lg shadow">
                    <p>
                         <strong>Learner:</strong> {session.learner.name}
                    </p>
                    <p>
                         <strong>Skill:</strong> {session.skill.name}
                    </p>
                    <p>
                         <strong>Time:</strong> {new Date(session.scheduledAt).toLocaleString()}
                    </p>

                    <div className="flex items-center justify-between gap-3 mt-4 ">
                         {/* {session.status === "CONFIRMED" && session.meetLink && ( */}
                         <a href={session.meetLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                              <Button variant="default" className="w-full sm:w-auto cursor-pointer">
                                   <Video className="w-4 h-4 mr-2" />
                                   Join Google Meet
                              </Button>
                         </a>
                         {/* )} */}

                         <Button variant="secondary" className="w-full sm:w-auto cursor-pointer" onClick={()=> handleGotoRoadmap()}>
                              View Roadmap
                         </Button>

                         <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2 cursor-pointer" onClick={()=> handleGotoChat()}>
                              <MessageCircleMore className="w-4 h-4" />
                              Chat
                         </Button>
                    </div>
               </div>
          </div>
     );
}
