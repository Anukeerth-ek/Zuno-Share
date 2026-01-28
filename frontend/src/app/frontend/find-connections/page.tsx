"use client";

import LeftSidebar from "@/app/components/HomeSections/Filters";
import { SearchResults } from "@/app/components/HomeSections/searchResult";
import { SearchBar } from "@/app/components/Searchbar";
import { useGetMyProfile } from "@/app/hooks/useGetMyProfile";
import { useGetUserConnections } from "@/app/hooks/useGetUserConnection";
import { User } from "@/types";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const FindConnections = () => {
     const [users, setUsers] = useState<User[]>([]);
     const [loading, setLoading] = useState(true);

     const [filters, setFilters] = useState({
          search: "",
          professional: [] as string[],
          experience: [] as string[],
          company: "",
          sort: "most-experienced",
     });

     const { user: myData, loading: myDataLoading } = useGetMyProfile();
     const { usersConnection, loading: connectionLoading, error } = useGetUserConnections(myData?.id);

     const router = useRouter();

     useEffect(() => {
          const params = new URLSearchParams();
          if (filters.search) params.set("search", filters.search);
          if (filters.company) params.set("company", filters.company);
          if (filters.professional.length) params.set("professional", filters.professional.join(","));
          if (filters.experience.length) params.set("experience", filters.experience.join(","));
          if (filters.sort) params.set("sort", filters.sort);

          router.replace(`?${params.toString()}`);
     }, [filters, router]);

     useEffect(() => {
          const fetchUsers = async () => {
               try {
                    setLoading(true);

                    const token = localStorage.getItem("token");
                    const headers: HeadersInit = {
                         "Content-Type": "application/json",
                         ...(token && { Authorization: `Bearer ${token}` }),
                    };

                    const params = new URLSearchParams();

                    if (filters.search) params.append("search", filters.search);
                    if (filters.company) params.append("company", filters.company);
                    if (filters.professional.length) params.append("professional", filters.professional.join(","));
                    if (filters.experience.length) params.append("experience", filters.experience.join(","));
                    if (filters.sort) params.append("sort", filters.sort);
                    const BASE_URL = getBaseUrl();
                    const url = `${BASE_URL}/api/filtered-profile/filter?${params.toString()}`;

                    const response = await fetch(url, { headers });
                    const data = await response.json();
                    setUsers(data.users);
               } catch (err) {
                    console.error("Error fetching users:", err);
               } finally {
                    setLoading(false);
               }
          };

          fetchUsers();
     }, [filters]);

     if (myDataLoading || connectionLoading) return <p>Loading...</p>;
     if (error) return <p>Error loading connections</p>;

     const connectedIds = new Set(usersConnection.map((c) => c.user.id));
     const visibleUsers = users?.filter((user) => !connectedIds.has(user.id));

     const smartSearch = async (prompt: string) => {
          try {
               const BASE_URL = getBaseUrl();
               const res = await fetch(`${BASE_URL}/aisearch/ai-query`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: prompt }),
               });

               const data = await res.json();
               const aiFilters = data.filters || {};

               const parsedProfessional = Array.isArray(aiFilters.professional)
                    ? aiFilters.professional.map((p: string) => p.toLowerCase())
                    : [];

               const parsedExperience = aiFilters.experience ? [aiFilters.experience] : [];

               setFilters({
                    search: aiFilters.search || "",
                    company: aiFilters.company || "",
                    professional: parsedProfessional,
                    experience: parsedExperience,
                    sort: aiFilters.sort || "most-experienced",
               });
          } catch (err) {
               console.error("Smart search failed ❌", err);
          }
     };

     return (
          <div className="flex mt-18">
               <LeftSidebar filters={filters} setFilters={setFilters} />
               <div className="flex-1 flex flex-col">
                    <div className="p-6">
                         <SearchBar
                              handleUserSearch={(e: React.ChangeEvent<HTMLInputElement>) =>
                                   setFilters((prev) => ({ ...prev, search: e.target.value }))
                              }
                              smartSearch={smartSearch}
                         />
                    </div>
                    <div className="flex flex-1">
                         <SearchResults
                              users={visibleUsers}
                              loading={loading}
                              // onUserClick={}
                         />
                    </div>
               </div>
          </div>
     );
};

export default FindConnections;
