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
               className="group relative bg-gray-900/40 backdrop-blur-sm cursor-pointer rounded-2xl p-6 border border-slate-700/50 hover:border-[#21cab9]/50 hover:shadow-[0_0_30px_-10px_rgba(33,202,185,0.3)] transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
          >
               {/* Premium Shine Effect */}
               <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shine" />
               </div>

               {/* Subtle background glow */}
               <div className="absolute -inset-2 bg-gradient-to-r from-[#21cab9]/0 via-[#21cab9]/5 to-[#21cab9]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-2xl pointer-events-none" />

               <div className="flex items-start justify-between mb-5 relative z-10">
                    <div className="flex items-center space-x-4">
                         <div className="relative">
                              <Avatar className="w-14 h-14 ring-2 ring-slate-700 group-hover:ring-[#21cab9] transition-all duration-500">
                                   <AvatarImage src={avatar} className="object-cover" />
                                   <AvatarFallback className="bg-gradient-to-br from-[#21cab9]/80 to-[#1da192]/80 text-white font-bold text-lg">
                                        {name.charAt(0).toUpperCase()}
                                   </AvatarFallback>
                              </Avatar>
                              {/* Online status indicator or similar could go here */}
                         </div>
                         <div className="flex-1">
                              <h3 className="text-white text-lg font-bold tracking-tight mb-1 group-hover:text-[#21cab9] transition-colors duration-300">
                                   {name}
                              </h3>
                              <div className="flex items-center space-x-0.5">
                                   <p className="text-sm text-gray-400 font-medium group-hover:text-gray-300 transition-colors">{professionTitle ?? "Not Provided"}</p>
                              </div>
                         </div>
                    </div>

                    <Button
                         variant="ghost"
                         size="icon"
                         className="text-gray-500 hover:text-[#21cab9] hover:bg-[#21cab9]/10 rounded-full transition-all duration-300 relative z-20"
                         onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark();
                         }}
                    >
                         <Heart
                              className={`w-5 h-5 transition-all duration-300 ${
                                   isBookmark ? "fill-[#21cab9] text-[#21cab9] scale-110" : "hover:scale-110"
                              }`}
                         />
                    </Button>
               </div>

               <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {skills.map((skill, index) => (
                         <Badge
                              key={index}
                              className="rounded-full px-4 py-1 text-[10px] uppercase tracking-wider font-bold border transition-all duration-300 hover:scale-110 bg-slate-800/40 text-gray-400 border-slate-700/50 group-hover:bg-[#21cab9]/10 group-hover:text-[#21cab9] group-hover:border-[#21cab9]/30"
                         >
                              {skill}
                         </Badge>
                    ))}
               </div>

               <div className="flex items-center justify-between relative z-10 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center space-x-2">
                         <div className="p-1.5 rounded-lg bg-slate-800/50 group-hover:bg-[#21cab9]/10 transition-colors">
                              <Star className="w-3.5 h-3.5 text-[#21cab9]" />
                         </div>
                         <span className="text-gray-300 group-hover:text-white font-medium text-sm tracking-wide transition-colors">
                              {companyName ?? "Not Provided"}
                         </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                         <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">EXP</span>
                         <span className="text-white font-bold text-sm">
                              {experience ? `${experience}y` : "N/A"}
                         </span>
                    </div>
               </div>
          </div>
     );
};
