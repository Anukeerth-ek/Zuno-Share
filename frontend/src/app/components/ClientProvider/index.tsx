"use client";

import { useSession } from "next-auth/react";
import { Toaster } from "sonner";
import useSocket from "@/app/hooks/useSocket";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const ClientProviders = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  useSocket(userId);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
};
