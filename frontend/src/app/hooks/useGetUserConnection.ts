"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBaseUrl } from "@/utils/getBaseUrl";

interface UserConnection {
     id: string;
     name?: string;
     jobTitle?: string;
     department: string;
     email?: string;
     avatar?: string;
     user: {
          id: string;
          name: string;
          skillsOffered?: { name: string }[];
          skillsWanted?: { name: string }[];
     };
}

interface UseGetUserConnectionsReturn {
     usersConnection: UserConnection[];
     loading: boolean;
     error: string | null;
     setUsersConnection: (updater: UserConnection[] | ((prev: UserConnection[]) => UserConnection[])) => void;
}

export function useGetUserConnections(userId?: string): UseGetUserConnectionsReturn {
     const queryClient = useQueryClient();
     const queryKey = ["connections", userId];

     const { data: usersConnection = [], isLoading: loading, error: queryError } = useQuery({
          queryKey,
          queryFn: async () => {
               const BASE_URL = getBaseUrl();
               const res = await fetch(`${BASE_URL}/api/connections/${userId}`);
               const data = await res.json();

               if (!res.ok) {
                    throw new Error(data.message || "Failed to fetch connections");
               }
               return data.connections || [];
          },
          enabled: !!userId,
          staleTime: 5 * 60 * 1000, // 5 minutes
     });

     const setUsersConnection = (updater: UserConnection[] | ((prev: UserConnection[]) => UserConnection[])) => {
          queryClient.setQueryData(queryKey, updater);
     };

     return { 
          usersConnection, 
          loading, 
          error: queryError ? (queryError as Error).message : null, 
          setUsersConnection 
     };
}
