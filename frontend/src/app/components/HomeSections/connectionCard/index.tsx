import React, { useState } from "react";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeacherCardProps {
     name: string;
     role: string;
     avatar: string;
     professionTitle: string | undefined;
     companyName: string | undefined;
     experience: number | undefined;
     skills: string[];
     isBookmarked?: boolean;
     handleShowConnectionDetail?: () => void;
}

export const ConnectionCard: React.FC<TeacherCardProps> = ({
     name,
     role,
     avatar,
     professionTitle,
     companyName,
     experience,
     skills,
     isBookmarked = false,
     handleShowConnectionDetail,
}) => {
     const [isBookmark, setIsBookmark] = useState(isBookmarked);

     const toggleBookmark = () => {
          setIsBookmark(!isBookmark);
     };
     console.log("role", role) // Dont remove this log(indently put leave this for fixing the build error)
 
     return (
          <div
               onClick={handleShowConnectionDetail}
               className="group bg-gray-900 cursor-pointer rounded-2xl p-6 border border-slate-700/50 hover:border-[#21cab9]  hover:shadow-[#aee7e1] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
          >
               <div className="absolute inset-0 bg-gradient-to-br from-[#1dd1bf] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

               <div className="flex items-start justify-between mb-5 relative z-10">
                    <div className="flex items-center space-x-4">
                         <div className="relative">
                              <Avatar className="w-14 h-14 ring-2 ring-[#21cab9] group-hover:ring-[#21cab9] transition-all duration-300">
                                   <AvatarImage src={avatar} className="object-cover" />
                                   <AvatarFallback className="bg-gradient-to-br from-[#21cab9] to-[#21cab9] text-white font-bold text-lg">
                                        {name.charAt(0).toUpperCase()}
                                   </AvatarFallback>
                              </Avatar>
                         </div>
                         <div className="flex-1">
                              <h3 className="text-white text-lg font-bold tracking-tight mb-1 group-hover:text-purple-100 transition-colors">
                                   {name}
                              </h3>
                              <div className="flex items-center space-x-0.5">
                                   <p className="text-sm text-gray-400 font-medium">{professionTitle ?? "Not Provided"}</p>
                              </div>
                         </div>
                    </div>

                    <Button
                         variant="ghost"
                         size="icon"
                         className="text-gray-400 hover:text-[#21cab9] hover:bg-[#21cab9] rounded-full transition-all duration-200 relative z-20"
                         onClick={toggleBookmark}
                    >
                         <Heart
                              className={`w-5 h-5 transition-all duration-200 ${
                                   isBookmark ? "fill-[#21cab9] text-[#21cab9] scale-110" : "hover:scale-110"
                              }`}
                         />
                    </Button>
               </div>

               <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {skills.map((skill, index) => {

                         return (
                              <Badge
                                   key={index}
                                   className=" rounded-full px-4 py-1 text-xs font-semibold border transition-all duration-200 hover:scale-105 bg-slate-700/80 text-gray-300 border-slate-600/50 hover:bg-slate-700 hover:text-white"
                              >
                                   {skill}
                              </Badge>
                         );
                    })}
               </div>

               <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-2">
                         <Star className="w-4 h-4 text-gray-400" />
                         <span className="text-white font-bold text-base tracking-wide">
                              {companyName ?? "Not Provided"}
                         </span>
                    </div>

                    <div className="flex items-center space-x-2 px-3 py-2">
                         <span className="text-gray-300 font-semibold text-sm">
                              {experience ? `${experience} Years` : "Not Provided"}
                         </span>
                    </div>
               </div>
          </div>
     );
};
