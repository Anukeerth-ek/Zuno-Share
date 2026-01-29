import React from "react";

const ShimmerItem = ({ className }: { className?: string }) => (
     <div className={`relative overflow-hidden bg-slate-800 ${className}`}>
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
     </div>
);

export const ConnectionCardSkeleton = () => {
     return (
          <div className="bg-gray-900/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 relative overflow-hidden">
               <div className="flex items-start justify-between mb-5 relative z-10">
                    <div className="flex items-center space-x-4 w-full">
                         <ShimmerItem className="w-14 h-14 rounded-full" />
                         <div className="flex-1 space-y-2">
                              <ShimmerItem className="h-5 rounded w-3/4" />
                              <ShimmerItem className="h-4 rounded w-1/2" />
                         </div>
                    </div>
                    <ShimmerItem className="w-8 h-8 rounded-full" />
               </div>

               <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {[1, 2, 3].map((i) => (
                         <ShimmerItem key={i} className="h-6 w-16 rounded-full" />
                    ))}
               </div>

               <div className="flex items-center justify-between relative z-10 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center space-x-2">
                         <ShimmerItem className="w-6 h-6 rounded" />
                         <ShimmerItem className="h-4 w-24 rounded" />
                    </div>
                    <ShimmerItem className="h-4 w-12 rounded" />
               </div>
          </div>
     );
};
