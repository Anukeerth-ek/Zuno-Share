// hooks/useAuthUser.ts
"use client";

import { useEffect, useState } from "react";
import { getBaseUrl } from "@/utils/getBaseUrl";

export type User = {
     id: string; // ✅ Add this field
     name: string;
     avatarUrl?: string;
     email?: string;
     role?: "LEARNER" | "MENTOR" | string;
     createdAt?: string;
};

export const useGetMyProfile = () => {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchUser = async () => {
               const token = localStorage.getItem("token");

               if (!token) {
                    setLoading(false);
                    return;
               }

               localStorage.setItem("token", token);
               // window.dispatchEvent(new Event("userLoggedIn"));
               if (!token) {
                    setLoading(false);
                    return;
               }

               try {
                    const BASE_URL = getBaseUrl();
                    const res = await fetch(`${BASE_URL}/api/profile/me`, {
                         headers: {
                              Authorization: `Bearer ${token}`,
                         },
                    });

                    if (!res.ok) console.log("not authorized");

                    const data = await res.json();
                    setUser(data.user);
               } catch (err) {
                    console.error("Failed to fetch user:", err);
                    setUser(null);
               } finally {
                    setLoading(false);
               }
          };

          fetchUser();
          window.addEventListener("userLoggedIn", fetchUser);
          return () => window.removeEventListener("userLoggedIn", fetchUser);
     }, []);

     return { user, loading };
};
