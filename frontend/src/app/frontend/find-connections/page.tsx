"use client";

import LeftSidebar from "@/app/components/HomeSections/Filters";
import { SearchResults } from "@/app/components/HomeSections/searchResult";
import { SearchBar } from "@/app/components/Searchbar";
import { useGetMyProfile } from "@/app/hooks/useGetMyProfile";
import { User } from "@/types";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

const FindConnections = () => {
     const [users, setUsers] = useState<User[]>([]);
     const [loading, setLoading] = useState(true);
     const [loadingMore, setLoadingMore] = useState(false);
     const [pagination, setPagination] = useState({
          page: 1,
          totalPages: 1,
          total: 0,
     });

     const [filters, setFilters] = useState({
          search: "",
          professional: [] as string[],
          experience: [] as string[],
          company: "",
          sort: "most-experienced",
     });

     const { loading: myDataLoading } = useGetMyProfile();

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

     const fetchUsers = React.useCallback(async (page: number, append: boolean = false) => {
          try {
               if (append) setLoadingMore(true);
               else setLoading(true);

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
               params.append("page", page.toString());
               params.append("limit", "12");

               const BASE_URL = getBaseUrl();
               const url = `${BASE_URL}/api/filtered-profile/filter?${params.toString()}`;

               const response = await fetch(url, { headers });
               const data = await response.json();

               if (append) {
                    setUsers((prev) => [...prev, ...data.users]);
               } else {
                    setUsers(data.users);
               }

               if (data.pagination) {
                    setPagination({
                         page: data.pagination.page,
                         totalPages: data.pagination.totalPages,
                         total: data.pagination.total,
                    });
               }
          } catch (err) {
               console.error("Error fetching users:", err);
          } finally {
               setLoading(false);
               setLoadingMore(false);
          }
     }, [filters]);

     useEffect(() => {
          fetchUsers(1, false);
     }, [fetchUsers]);

     const handleLoadMore = () => {
          if (pagination.page < pagination.totalPages) {
               fetchUsers(pagination.page + 1, true);
          }
     };

     if (myDataLoading) return null;

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
          <div className="flex items-start mt-18 min-h-[calc(100vh-72px)]">
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
                    <div className="flex flex-1 flex-col">
                         <SearchResults
                              users={users}
                              loading={loading}
                         />

                         {pagination.page < pagination.totalPages && (
                              <div className="flex justify-center p-8">
                                   <Button
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                        variant="outline"
                                        className="min-w-[150px] shadow-sm hover:shadow-md transition-all"
                                   >
                                        {loadingMore ? "Loading more..." : "Load More"}
                                   </Button>
                              </div>
                         )}
                    </div>
               </div>
          </div>
     );
};

export default FindConnections;
