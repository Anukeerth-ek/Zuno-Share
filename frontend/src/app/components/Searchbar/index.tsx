import React, { useState } from "react";
import {Search, Sparkles } from "lucide-react";
// import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type SearchBarProps = {
  handleUserSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  smartSearch: (prompt: string) => void;
};

export const SearchBar = ({ handleUserSearch, smartSearch  }: SearchBarProps) => {
     const [open, setOpen] = useState(false);
     const [input, setInput] = useState("");

     const handleSearch = () => {
       console.log("Searching for:", input);
        smartSearch(input); 
          setOpen(false);
     };
     return (
          <>
               <div className="flex items-center space-x-4 mb-6">
                    <div className="relative flex-1">
                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                         <Input
                              placeholder="Search Skill Swap"
                              className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                              onChange={handleUserSearch}
                         />
                    </div>
                    <Button
                         variant="outline"
                         className=" bg-gray-800 border-gray-700 text-white hover:bg-gray-700 text-left"
                    >
                         Find Mate
                         {/* <ChevronDown className="w-36 h-4 ml-2" /> */}
                    </Button>
                    <Button 
                         onClick={() => setOpen(true)} 
                         className="w-64 relative group overflow-hidden cursor-pointer bg-gradient-to-r from-[#21cab9] to-[#1da192] hover:from-[#1da192] hover:to-[#21cab9] text-white font-bold px-8 shadow-[0_0_20px_-5px_rgba(33,202,185,0.4)] hover:shadow-[0_0_25px_-5px_rgba(33,202,185,0.6)] transition-all duration-300 rounded-xl"
                    >
                         <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full skew-x-12 transition-transform duration-700" />
                         <span className="relative z-10 flex items-center gap-2 tracking-tight">
                              SMART SEARCH <Sparkles className="w-4 h-4" />
                         </span>
                    </Button>
               </div>

               <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="max-w-md rounded-2xl">
                         <DialogHeader>
                              <DialogTitle className="text-xl font-semibold text-center">
                                   Welcome to Swapper Smart Search
                              </DialogTitle>
                              <DialogDescription className="text-center mt-2 text-base">
                                   Please write the prompt here to do the search
                              </DialogDescription>
                         </DialogHeader>

                         {/* Textarea */}
                         <Textarea
                              placeholder="Type your query..."
                              value={input}
                              onChange={(e) => setInput(e.target.value)}
                              className="mt-4 min-h-[120px] resize-none"
                         />

                         {/* Search Button */}
                         <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700" onClick={handleSearch}>
                              Search
                         </Button>
                    </DialogContent>
               </Dialog>
          </>
     );
};
