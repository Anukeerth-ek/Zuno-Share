"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Plus, X, Lightbulb, User as UserIcon, Building2, Camera, Save, MapPin, Sparkles, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { profileData } from "@/types";

const ProfileCreatePage = () => {
     const router = useRouter();

     const [formData, setFormData] = useState<profileData>({
          name: "",
          bio: "",
          avatarUrl: "",
          timeZone: "",
          professionDetails: { title: "" },
          currentOrganization: { organization: "" },
          experienceSummary: { years: "" },
          skillsOffered: [],
          skillsWanted: [],
     });

     const [newSkillOffered, setNewSkillOffered] = useState("");
     const [newSkillNeeded, setNewSkillNeeded] = useState("");
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
     const [isEdit, setIsEdit] = useState(false);

     const handleAvatarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const previewUrl = URL.createObjectURL(file);

          setAvatarPreview((prev) => {
               if (prev) URL.revokeObjectURL(prev);
               return previewUrl;
          });
     }, []);

     const commonTimezones = [
          "UTC",
          "America/New_York",
          "America/Los_Angeles",
          "America/Chicago",
          "Europe/London",
          "Europe/Paris",
          "Europe/Berlin",
          "Asia/Tokyo",
          "Asia/Shanghai",
          "Asia/Dubai",
          "Australia/Sydney",
          "Asia/Kolkata",
     ];

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
          const { name, value } = e.target;

          setFormData((prev) => {
               if (name === "professionTitle") {
                    return { ...prev, professionDetails: { title: value } };
               }
               if (name === "organization") {
                    return { ...prev, currentOrganization: { organization: value } };
               }
               if (name === "experienceYears") {
                    return { ...prev, experienceSummary: { years: value } };
               }
               return { ...prev, [name]: value };
          });
     };

     const addSkillOffered = () => {
          if (newSkillOffered.trim() && !formData.skillsOffered.includes(newSkillOffered.trim())) {
               setFormData((prev) => ({
                    ...prev,
                    skillsOffered: [...prev.skillsOffered, newSkillOffered.trim()],
               }));
               setNewSkillOffered("");
          }
     };

     const removeSkillOffered = (skillToRemove: string) => {
          setFormData((prev) => ({
               ...prev,
               skillsOffered: prev.skillsOffered.filter((skill) => skill !== skillToRemove),
          }));
     };

     const addSkillNeeded = () => {
          if (newSkillNeeded.trim() && !formData.skillsWanted.includes(newSkillNeeded.trim())) {
               setFormData((prev) => ({
                    ...prev,
                    skillsWanted: [...prev.skillsWanted, newSkillNeeded.trim()],
               }));
               setNewSkillNeeded("");
          }
     };

     const removeSkillNeeded = (skillToRemove: string) => {
          setFormData((prev) => ({
               ...prev,
               skillsWanted: prev.skillsWanted.filter((skill) => skill !== skillToRemove),
          }));
     };

     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
          e.preventDefault();
          setIsSubmitting(true);

          try {
               const token = localStorage.getItem("token");
               if (!token) return;

               const avatarFileInput = document.getElementById("avatarFile") as HTMLInputElement;
               const avatarFile = avatarFileInput?.files?.[0];

               const formDataToSend = new FormData();
               formDataToSend.append("name", formData.name);
               formDataToSend.append("bio", formData.bio || "");
               formDataToSend.append("timeZone", formData.timeZone || "");
               formDataToSend.append("professionTitle", formData.professionDetails.title);
               formDataToSend.append("organization", formData.currentOrganization.organization);
               formDataToSend.append("experienceYears", formData.experienceSummary.years);

               if (avatarFile) formDataToSend.append("avatar", avatarFile);

               formData.skillsOffered.forEach((skill) => formDataToSend.append("skillsOffered[]", skill));
               formData.skillsWanted.forEach((skill) => formDataToSend.append("skillsWanted[]", skill));

               const BASE_URL = getBaseUrl();
               const url = isEdit ? `${BASE_URL}/api/profile/update` : `${BASE_URL}/api/profile`;

               const response = await fetch(url, {
                    method: isEdit ? "PUT" : "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formDataToSend,
               });

               if (response.ok) router.push("/");
          } catch (error) {
               console.error("Error saving profile:", error);
          } finally {
               setIsSubmitting(false);
          }
     };

     useEffect(() => {
          const fetchProfile = async () => {
               const token = localStorage.getItem("token");
               if (!token) {
                    router.push("/");
                    return;
               }
               const BASE_URL = getBaseUrl();
               const res = await fetch(`${BASE_URL}/api/profile/me`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
               });

               const data = await res.json();
               if (res.ok && data.user) {
                    setIsEdit(true);
                    setFormData({
                         name: data.user.name || "",
                         bio: data.user.bio || "",
                         avatarUrl: data.user.avatarUrl || "",
                         timeZone: data.user.timeZone || "",
                         professionDetails: { title: data.user.professionDetails?.title || "" },
                         currentOrganization: { organization: data.user.currentOrganization?.organization || "" },
                         experienceSummary: { years: data.user.experienceSummary?.years?.toString() || "" },
                         skillsOffered: data.user.skillsOffered?.map((s: { name: string }) => s.name) || [],
                         skillsWanted: data.user.skillsWanted?.map((s: { name: string }) => s.name) || [],
                    });
                    if (data.user.avatarUrl) setAvatarPreview(data.user.avatarUrl);
               }
          };
          fetchProfile();
     }, [router]);

     useEffect(() => {
          return () => {
               if (avatarPreview) {
                    URL.revokeObjectURL(avatarPreview);
               }
          };
     }, [avatarPreview]);

     return (
          <div className="min-h-screen bg-[#030712] relative isolate overflow-hidden">
               <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                         <aside className="lg:w-1/3 lg:sticky lg:top-28 w-full will-change-transform">
                              <Card className="bg-white/[0.03] backdrop-blur-xl border-white/[0.08] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                                   <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-primary/20 to-accent/20" />
                                   <CardContent className="relative pt-16 flex flex-col items-center">
                                        <div className="relative group mb-6">
                                             <div className="w-40 h-40 rounded-3xl border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-2xl transition-transform group-hover:scale-[1.02]">
                                                  {avatarPreview ? (
                                                       <Image
                                                            src={avatarPreview}
                                                            alt="Preview"
                                                            fill
                                                            className="object-cover"
                                                            loading="lazy"
                                                       />
                                                  ) : (
                                                       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                            <UserIcon className="w-20 h-20 text-slate-600" />
                                                       </div>
                                                  )}
                                             </div>
                                             <label
                                                  htmlFor="avatarFile"
                                                  className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl cursor-pointer hover:bg-primary/90 transition-all shadow-xl ring-4 ring-[#030712] group-active:scale-95"
                                             >
                                                  <Camera className="w-5 h-5" />
                                                  <input
                                                       type="file"
                                                       id="avatarFile"
                                                       name="avatar"
                                                       accept="image/*"
                                                       className="hidden"
                                                       onChange={handleAvatarChange}
                                                  />
                                             </label>
                                        </div>

                                        <div className="text-center space-y-2 mb-8">
                                             <h2 className="text-3xl font-bold text-white tracking-tight">
                                                  {formData.name || "Your Name"}
                                             </h2>
                                             <p className="text-primary font-medium">
                                                  {formData.professionDetails.title || "Profession Title"}
                                             </p>
                                             <p className="text-slate-500 text-sm max-w-xs mx-auto line-clamp-3 italic">
                                                  {formData.bio || "Write something about yourself in the bio section..."}
                                             </p>
                                        </div>

                                        <div className="w-full space-y-4 pt-4">
                                             <div className="flex items-center gap-3 text-slate-400 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                                                  <Building2 className="w-4 h-4 text-primary" />
                                                  <span className="truncate">
                                                       {formData.currentOrganization.organization || "No Organization"}
                                                  </span>
                                             </div>
                                             <div className="flex items-center gap-3 text-slate-400 text-sm bg-white/5 p-3 rounded-xl border border-white/5">
                                                  <MapPin className="w-4 h-4 text-primary" />
                                                  <span>{formData.timeZone || "No Timezone Selected"}</span>
                                             </div>
                                        </div>
                                   </CardContent>
                              </Card>

                              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 flex items-start gap-4">
                                   <Sparkles className="w-6 h-6 text-primary shrink-0 mt-1" />
                                   <div>
                                        <h4 className="text-white font-semibold mb-1">Impact Score</h4>
                                        <p className="text-slate-400 text-sm">
                                             Complete your profile to increase your visibility to find better peers.
                                        </p>
                                   </div>
                              </div>
                         </aside>

                         <main className="lg:w-2/3 w-full space-y-8 will-change-transform">
                              <div className="space-y-2 mb-10">
                                   <p className="text-slate-500 text-lg bg-clip-text bg-gradient-to-r from-primary to-accent">
                                        Detailed information helps you connect with the right skill mates.
                                   </p>
                              </div>

                              <form onSubmit={handleSubmit} className="space-y-8">
                                   <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-lg overflow-hidden ring-1 ring-white/5 shadow-xl">
                                        <CardHeader className="bg-white/[0.02] border-b border-white/[0.05]">
                                             <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                                  <ShieldCheck className="w-5 h-5 text-primary" />
                                                  Professional Identity
                                             </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-8">
                                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                  <div className="space-y-3 lowercase">
                                                       <Label htmlFor="name" className="text-slate-300 font-medium">
                                                            Display Name *
                                                       </Label>
                                                       <Input
                                                            id="name"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="bg-slate-950/40 border-white/10 text-white h-12 focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
                                                       />
                                                  </div>
                                                  <div className="space-y-3">
                                                       <Label
                                                            htmlFor="professionTitle"
                                                            className="text-slate-300 font-medium"
                                                       >
                                                            Professional Title *
                                                       </Label>
                                                       <Input
                                                            id="professionTitle"
                                                            name="professionTitle"
                                                            value={formData.professionDetails.title}
                                                            onChange={handleInputChange}
                                                            required
                                                            placeholder="Senior Architect, Growth Expert..."
                                                            className="bg-slate-950/40 border-white/10 text-white h-12 focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
                                                       />
                                                  </div>
                                                  <div className="space-y-3">
                                                       <Label htmlFor="organization" className="text-slate-300 font-medium">
                                                            Current Organization
                                                       </Label>
                                                       <Input
                                                            id="organization"
                                                            name="organization"
                                                            value={formData.currentOrganization.organization}
                                                            onChange={handleInputChange}
                                                            className="bg-slate-950/40 border-white/10 text-white h-12 rounded-xl"
                                                       />
                                                  </div>
                                                  <div className="space-y-3">
                                                       <Label
                                                            htmlFor="experienceYears"
                                                            className="text-slate-300 font-medium"
                                                       >
                                                            Years in Field *
                                                       </Label>
                                                       <Input
                                                            id="experienceYears"
                                                            name="experienceYears"
                                                            value={formData.experienceSummary.years}
                                                            onChange={handleInputChange}
                                                            required
                                                            className="bg-slate-950/40 border-white/10 text-white h-12 rounded-xl"
                                                       />
                                                  </div>
                                             </div>

                                             <div className="space-y-3">
                                                  <Label htmlFor="timeZone" className="text-slate-300 font-medium">
                                                       Standard Timezone
                                                  </Label>
                                                  <Select
                                                       value={formData.timeZone}
                                                       onValueChange={(v) => setFormData((p) => ({ ...p, timeZone: v }))}
                                                  >
                                                       <SelectTrigger className="bg-slate-950/40 border-white/10 text-white h-12 rounded-xl">
                                                            <SelectValue placeholder="Select Timezone" />
                                                       </SelectTrigger>
                                                       <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                            {commonTimezones.map((tz) => (
                                                                 <SelectItem key={tz} value={tz}>
                                                                      {tz}
                                                                 </SelectItem>
                                                            ))}
                                                       </SelectContent>
                                                  </Select>
                                             </div>

                                             <div className="space-y-3">
                                                  <Label htmlFor="bio" className="text-slate-300 font-medium">
                                                       Strategic Bio
                                                  </Label>
                                                  <Textarea
                                                       id="bio"
                                                       name="bio"
                                                       value={formData.bio}
                                                       onChange={handleInputChange}
                                                       placeholder="Briefly explain your value proposition..."
                                                       className="bg-slate-950/40 border-white/10 text-white min-h-[120px] rounded-xl"
                                                  />
                                             </div>
                                        </CardContent>
                                   </Card>

                                   <Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-lg ring-1 ring-white/5 shadow-xl">
                                        <CardHeader className="bg-white/[0.02] border-b border-white/[0.05]">
                                             <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                                  <Lightbulb className="w-5 h-5 text-accent" />
                                                  Capability Stack
                                             </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8 space-y-12">
                                             <div className="space-y-5">
                                                  <div className="flex items-center justify-between">
                                                       <Label className="text-primary font-bold text-sm uppercase tracking-widest">
                                                            Mastery To Offer
                                                       </Label>
                                                       <span className="text-xs text-slate-500 uppercase tracking-tighter">
                                                            Add skills you can teach others
                                                       </span>
                                                  </div>
                                                  <div className="flex gap-2">
                                                       <Input
                                                            value={newSkillOffered}
                                                            onChange={(e) => setNewSkillOffered(e.target.value)}
                                                            onKeyDown={(e) =>
                                                                 e.key === "Enter" &&
                                                                 (e.preventDefault(), addSkillOffered())
                                                            }
                                                            placeholder="React.js, Strategy, Branding..."
                                                            className="bg-slate-950/40 border-white/10 text-white h-12 rounded-xl"
                                                       />
                                                       <Button
                                                            type="button"
                                                            onClick={addSkillOffered}
                                                            className="bg-primary hover:bg-primary/90 text-white h-12 px-6 rounded-xl font-bold"
                                                       >
                                                            <Plus className="w-5 h-5" />
                                                       </Button>
                                                  </div>
                                                  <div className="flex flex-wrap gap-2 pt-2">
                                                       {formData.skillsOffered.map((skill, i) => (
                                                            <Badge
                                                                 key={i}
                                                                 className="bg-primary/10 text-primary border-primary/20 py-2 px-4 rounded-xl text-sm font-semibold flex items-center gap-2"
                                                            >
                                                                 {skill}
                                                                 <X
                                                                      className="w-4 h-4 cursor-pointer hover:text-white"
                                                                      onClick={() => removeSkillOffered(skill)}
                                                                 />
                                                            </Badge>
                                                       ))}
                                                  </div>
                                             </div>

                                             <Separator className="bg-white/5" />

                                             <div className="space-y-5">
                                                  <div className="flex items-center justify-between">
                                                       <Label className="text-accent font-bold text-sm uppercase tracking-widest">
                                                            Mastery To Gain
                                                       </Label>
                                                       <span className="text-xs text-slate-500 uppercase tracking-tighter">
                                                            Add what you want to learn
                                                       </span>
                                                  </div>
                                                  <div className="flex gap-2">
                                                       <Input
                                                            value={newSkillNeeded}
                                                            onChange={(e) => setNewSkillNeeded(e.target.value)}
                                                            onKeyDown={(e) =>
                                                                 e.key === "Enter" && (e.preventDefault(), addSkillNeeded())
                                                            }
                                                            placeholder="Go, AI/ML, Design Systems..."
                                                            className="bg-slate-950/40 border-white/10 text-white h-12 rounded-xl"
                                                       />
                                                       <Button
                                                            type="button"
                                                            onClick={addSkillNeeded}
                                                            className="bg-accent hover:bg-accent/90 text-accent-foreground h-12 px-6 rounded-xl font-bold"
                                                       >
                                                            <Plus className="w-5 h-5" />
                                                       </Button>
                                                  </div>
                                                  <div className="flex flex-wrap gap-2 pt-2">
                                                       {formData.skillsWanted.map((skill, i) => (
                                                            <Badge
                                                                 key={i}
                                                                 className="bg-accent/10 text-accent border-accent/20 py-2 px-4 rounded-xl text-sm font-semibold flex items-center gap-2"
                                                            >
                                                                 {skill}
                                                                 <X
                                                                      className="w-4 h-4 cursor-pointer hover:text-white"
                                                                      onClick={() => removeSkillNeeded(skill)}
                                                                 />
                                                            </Badge>
                                                       ))}
                                                  </div>
                                             </div>
                                        </CardContent>
                                   </Card>

                                   <div className="flex justify-end pt-4">
                                        <Button
                                             type="submit"
                                             disabled={isSubmitting || !formData.name.trim()}
                                             className="min-w-[240px] bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-black text-lg h-16 rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50"
                                        >
                                             {isSubmitting ? (
                                                  <div className="flex items-center gap-4">
                                                       <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                                       Processing Identity...
                                                  </div>
                                             ) : (
                                                  <div className="flex items-center gap-3">
                                                       <Save className="w-6 h-6" />
                                                       {isEdit ? "Update Ecosystem Profile" : "Initialize Identity"}
                                                  </div>
                                             )}
                                        </Button>
                                   </div>
                              </form>
                         </main>
                    </div>
               </div>
          </div>
     );
};

export default ProfileCreatePage;
