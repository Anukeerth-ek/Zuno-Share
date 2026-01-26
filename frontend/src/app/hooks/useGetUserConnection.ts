"use client";

import { useEffect, useState } from "react";
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
     setUsersConnection?: React.Dispatch<React.SetStateAction<UserConnection[]>>;
}

export function useGetUserConnections(userId?: string): UseGetUserConnectionsReturn {
     const [usersConnection, setUsersConnection] = useState<UserConnection[]>([]);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          if (!userId) return;

          const controller = new AbortController();
          const signal = controller.signal;

          const fetchConnections = async () => {
               setLoading(true);
               setError(null);
               try {
                    const BASE_URL = getBaseUrl();
                    const res = await fetch(`${BASE_URL}/api/connections/${userId}`, { signal });
                    const data = await res.json();

                    if (res.ok) {
                         setUsersConnection(data.connections || []);
                    } else {
                         setError(data.message || "Failed to fetch connections");
                    }
               } catch (err: unknown) {
                    if (err instanceof Error) {
                         // It's a real Error object
                         if (err.name !== "AbortError") {
                              setError(err.message || "Something went wrong");
                         }
                    } else {
                         // fallback for non-Error thrown values
                         setError("Something went wrong");
                    }
               } finally {
                    setLoading(false);
               }
          };

          fetchConnections();

          // ✅ Cleanup: abort request if component unmounts or userId changes
          return () => {
               controller.abort();
          };
     }, [userId]);

     return { usersConnection, loading, error, setUsersConnection };
}
