"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Share2 } from "lucide-react";
// import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useGetMyProfile } from "@/app/hooks/useGetMyProfile";
import { User } from "@/types";
import { formatDate } from "@/utils/formatData";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const ConnectionDetailSideBar = ({ user }: { user: User }) => {
     const [connectionSent, setConnectionSent] = useState(false);
     const { user: currentUser } = useGetMyProfile();

     useEffect(() => {
          if (!currentUser?.id || !user?.id) return;

          const sent = user.receivedConnections?.some((connection) => connection.senderId === currentUser.id);
          const received = user.sentConnections?.some((connection) => connection.receiverId === currentUser.id);

          if (sent || received) {
               setConnectionSent(true);
          }
     }, [currentUser?.id, user]);

     // const [isFollowing, setIsFollowing] = useState(false);

     const handleSendConnection = async () => {
          if (!currentUser?.id) {
               toast.error("You must be logged in to connect");
               return;
          }

          try {
               const BASE_URL = getBaseUrl();
               const response = await fetch(`${BASE_URL}/api/connections/request`, {
                    method: "POST",
                    headers: {
                         "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                         senderId: currentUser?.id,
                         receiverId: user.id,
                    }),
               });

               const data = await response.json();

               if (!response.ok) {
                    // Check if error is "Connection already exists"
                    if (data.message === "Connection already exists") {
                         toast.info("Connection already exists");
                         setConnectionSent(true); // ⬅️ Still set this to update UI
                    } else {
                         toast.error(data.message || "Failed to send request");
                    }
                    return;
               }

               setConnectionSent(true);
               toast.success("Connection request sent! ✅");
          } catch (err) {
               console.error("Send connection error", err);
               toast.error("Something went wrong");
          }
     };

     return (
          <div className=" bg-gray-900 text-white p-6">
               <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center justify-end w-full">
                         {/* <div className="flex items-center justify-end space-x-2"> */}
                         <Button variant="ghost" size="icon">
                              <Share2 className="w-4 h-4" />
                         </Button>
                         {/* <Button variant="ghost" size="icon">
                                   <Bookmark className="w-4 h-4" />
                              </Button> */}
                         {/* </div> */}
                         {/* <Button
                              onClick={() => setIsFollowing(!isFollowing)}
                              className="border cursor-pointer hover:text-gray-100"
                         >
                              {isFollowing ? "Following" : "Follow"}
                         </Button> */}
                    </div>
               </div>

               <div className="text-center mb-6">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                         <AvatarImage src="/api/placeholder/80/80" />
                         <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold mb-1">{user?.name}</h2>
                    <p className="text-gray-400 mb-4">{user?.professionDetails?.title || "Not Provided"}</p>
               </div>

               <div className="space-y-4 mb-6">
                    {/* <div className="flex justify-between">
                         <span className="text-gray-400">Readiness</span>
                         <span className="text-green-400">Hired</span>
                    </div> */}
                    <div className="flex justify-between">
                         <span className="text-gray-400">Company Name</span>
                         <span className="text-white">{user?.currentOrganization?.organization || "Not Provided"}</span>
                    </div>
                    {/* <div className="flex justify-between">
                         <span className="text-gray-400">Current Profession</span>
                         <span className="text-white">{user?.professionDetails?.title}</span>
                    </div> */}
                    <div className="flex justify-between">
                         <span className="text-gray-400">Experience</span>
                         <span className="text-white">
                              {user?.experienceSummary?.years !== null
                                   ? `${user?.experienceSummary?.years} Years`
                                   : "Not Provided"}
                         </span>
                    </div>

                    <div className="flex justify-between">
                         <span className="text-gray-400">Skills Offering</span>
                         <div className="flex flex-wrap gap-2 justify-center">
                              {user?.skillsOffered?.map((skill, idx) => (
                                   <Badge
                                        key={idx}
                                        className={`${
                                             skill.name === "Python"
                                                  ? "bg-purple-600 hover:bg-purple-700"
                                                  : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                   >
                                        {skill.name}
                                   </Badge>
                              ))}
                         </div>
                    </div>

                    <div className="flex justify-between">
                         <span className="text-gray-400">Skills Needed</span>
                         <div className="flex flex-wrap gap-2 justify-center">
                              {user?.skillsWanted?.slice(0, 2).map((skill, idx) => (
                                   <Badge
                                        key={idx}
                                        className={`${
                                             // skill.name === "Python"
                                             // ? "bg-purple-600 hover:bg-purple-700"
                                             // :
                                             "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                   >
                                        {skill.name}
                                   </Badge>
                              ))}

                              {user?.skillsWanted?.length > 2 && (
                                   <TooltipProvider>
                                        <Tooltip>
                                             <TooltipTrigger asChild>
                                                  <Badge className="bg-gray-700 hover:bg-gray-600 cursor-pointer">
                                                       +{user.skillsWanted.length - 2}
                                                  </Badge>
                                             </TooltipTrigger>
                                             <TooltipContent className="flex flex-col gap-1">
                                                  {user.skillsWanted.slice(2).map((skill, idx) => (
                                                       <span key={idx}>{skill.name}</span>
                                                  ))}
                                             </TooltipContent>
                                        </Tooltip>
                                   </TooltipProvider>
                              )}
                         </div>
                    </div>
                    <div className="flex justify-between">
                         <span className="text-gray-400">On this platform</span>
                         <span className="text-white">{user?.createdAt ? formatDate(user?.createdAt) : "Today"}</span>
                    </div>
               </div>

               <div className="mb-6">
                    <h3 className="font-medium mb-3">Bio</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{user?.bio || "Not Provided"}</p>
               </div>

               {/* <div className="mb-6">
                    <h3 className="font-medium mb-2">Hour rate</h3>
                    <p className="text-gray-400">$24/h</p>
               </div> */}

               <Button
                    onClick={handleSendConnection}
                    disabled={connectionSent}
                    className="w-full bg-purple-600 cursor-pointer hover:bg-purple-700 text-white"
               >
                    {connectionSent ? "Request Sent ✅" : "Add Connection"}
               </Button>
          </div>
     );
};
