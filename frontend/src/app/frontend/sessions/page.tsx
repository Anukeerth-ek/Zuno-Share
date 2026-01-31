"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Clock, Award, User, BookOpen, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Session {
     id: string;
     mentor: { name: string };
     learner: { name: string };
     skill: { name: string };
     status: "PENDING" | "CONFIRMED" | "REJECTED";
     scheduledAt: string;
     meetLink?: string;
     mentorId?: string;
     learnerId?: string;
}

const SessionsPage = () => {
     const [loading, setLoading] = useState(true);
     const [approvingSession, setApprovingSession] = useState<string | null>(null);

     const [requestedSessions, setRequestedSessions] = useState<Session[]>([]);
     const [receivedSessions, setReceivedSessions] = useState<Session[]>([]);

     const fetchSessions = async () => {
          const token = localStorage.getItem("token");
          if (!token) return;

          try {
               const BASE_URL = getBaseUrl();
               const res = await fetch(`${BASE_URL}/api/sessions/my-sessions`, {
                    headers: {
                         Authorization: `Bearer ${token}`,
                    },
               });

               const data = await res.json();
               const fetchedSessions = data.sessions || [];

               // setSessions(fetchedSessions);

               // ✅ Fetch user to separate sessions
               const userRes = await fetch(`${BASE_URL}/api/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` },
               });
               const userData = await userRes.json();
               const userId = userData.user?.id;

               const requested = fetchedSessions.filter((s: Session) => s.learnerId === userId);
               const received = fetchedSessions.filter((s: Session) => s.mentorId === userId);

               setRequestedSessions(requested);
               setReceivedSessions(received);
          } catch (err) {
               console.error("Failed to fetch sessions:", err);
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          fetchSessions();
     }, []);

     const approveSession = async (id: string) => {
          const token = localStorage.getItem("token");
          if (!token) return;

          setApprovingSession(id);

          try {
               const BASE_URL = getBaseUrl();
               const res = await fetch(`${BASE_URL}/api/google-token/status`, {
                    headers: {
                         Authorization: `Bearer ${token}`,
                    },
               });

               if (!res.ok) {
                    console.error("Failed to check Google Calendar connection:", res.status);
                    await updateSessionStatus(id, "CONFIRMED");
                    return;
               }

               const { hasTokens } = await res.json();

               if (!hasTokens) {
                    console.log("No Google tokens found, redirecting to OAuth...");
                    window.location.href = `${BASE_URL}/api/google/auth?token=${token}`;
                    return;
               }

               console.log("Google tokens found, proceeding with approval...");
               await updateSessionStatus(id, "CONFIRMED");
          } catch (err) {
               console.error("Error checking Google Calendar status:", err);
               await updateSessionStatus(id, "CONFIRMED");
          } finally {
               setApprovingSession(null);
          }
     };

     const rejectSession = async (id: string) => {
          await updateSessionStatus(id, "REJECTED");
     };

     const updateSessionStatus = async (id: string, status: "CONFIRMED" | "REJECTED") => {
          const token = localStorage.getItem("token");
          if (!token) return;

          try {
               const BASE_URL = getBaseUrl();
               const res = await fetch(`${BASE_URL}/api/sessions/approve/${id}`, {
                    method: "PATCH",
                    headers: {
                         "Content-Type": "application/json",
                         Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status }),
               });

               if (!res.ok) {
                    const data = await res.json();
                    console.error("Session update error:", data);

                    if (data.message?.includes("Google Calendar not connected") || data.message?.includes("Google Meet")) {
                         alert("Google Calendar needs to be reconnected. You'll be redirected to Google OAuth.");
                         window.location.href = `${BASE_URL}/api/google/auth?token=${token}`;
                         return;
                    } else {
                         alert(data.message || "Failed to update session status");
                    }
               } else {
                    await fetchSessions();
                    if (status === "CONFIRMED") {
                         alert("Session approved! Google Meet link has been created and sent to participants.");
                    }
               }
          } catch (error) {
               console.error("Error updating session status:", error);
               alert("Failed to update session status. Please try again.");
          }
     };

     const deleteSession = async (id: string) => {
          const token = localStorage.getItem("token");
          if (!token) return;

          if (!confirm("Are you sure you want to delete this session?")) return;

          try {
               const BASE_URL = getBaseUrl();
               const res = await fetch(`${BASE_URL}/api/sessions/delete/${id}`, {
                    method: "DELETE",
                    headers: {
                         Authorization: `Bearer ${token}`,
                    },
               });

               if (!res.ok) {
                    const data = await res.json();
                    alert(data.message || "Failed to delete session");
               } else {
                    fetchSessions();
               }
          } catch (error) {
               console.error("Error deleting session:", error);
          }
     };

     const router = useRouter();

     const handleSessions = (session: Session) => {
          localStorage.setItem("selectedSession", JSON.stringify(session));
          router.push(`/frontend/sessions/${session.id}`);
     };

     	return (
		<div className="min-h-screen bg-[#030712] relative isolate overflow-hidden pt-24 pb-12 px-6 lg:px-12 mt-10">
			<div className="absolute inset-0 -z-10 h-full w-full bg-[#030712]">
				<div className="absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden blur-3xl pointer-events-none" aria-hidden="true">
					<div className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-primary/20 to-[#2563eb]/20 opacity-10" />
				</div>
			</div>

			<div className="max-w-7xl mx-auto space-y-10">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
							<BookOpen className="w-3 h-3" />
							Knowledge Exchange
						</div>
						<h1 className="text-4xl font-black text-white tracking-tight">
							My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sessions</span>
						</h1>
						<p className="text-slate-500 max-w-lg">Track, manage and attend your scheduled skill-sharing sessions and mentorship meetings.</p>
					</div>
				</div>

				{loading ? (
					<div className="flex flex-col items-center justify-center py-24 gap-4">
						<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
						<p className="text-slate-400 font-medium animate-pulse">Syncing your sessions...</p>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
						{/* Requested Sessions Section */}
						<div className="space-y-6">
							<div className="flex items-center gap-3 px-2">
								<div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
									<Calendar className="w-5 h-5 text-blue-400" />
								</div>
								<h2 className="text-xl font-black text-white uppercase tracking-wider">Requested</h2>
							</div>

							{requestedSessions.length === 0 ? (
								<Card className="bg-white/[0.02] border-dashed border-white/10 p-12 text-center rounded-3xl">
									<div className="flex flex-col items-center space-y-4">
										<Clock className="w-12 h-12 text-slate-800" />
										<p className="text-slate-500 font-bold">No requested sessions yet</p>
									</div>
								</Card>
							) : (
								<div className="space-y-4">
									{requestedSessions.map((session) => (
										<SessionCard
											key={session.id}
											session={session}
											approvingSession={approvingSession}
											approveSession={approveSession}
											rejectSession={rejectSession}
											deleteSession={deleteSession}
											handleSessions={handleSessions}
											showActions={false}
										/>
									))}
								</div>
							)}
						</div>

						{/* Received Requests Section */}
						<div className="space-y-6">
							<div className="flex items-center gap-3 px-2">
								<div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20">
									<AlertCircle className="w-5 h-5 text-green-400" />
								</div>
								<h2 className="text-xl font-black text-white uppercase tracking-wider">Received</h2>
							</div>

							{receivedSessions.length === 0 ? (
								<Card className="bg-white/[0.02] border-dashed border-white/10 p-12 text-center rounded-3xl">
									<div className="flex flex-col items-center space-y-4">
										<BookOpen className="w-12 h-12 text-slate-800" />
										<p className="text-slate-500 font-bold">No received requests</p>
									</div>
								</Card>
							) : (
								<div className="space-y-4">
									{receivedSessions.map((session) => (
										<SessionCard
											key={session.id}
											session={session}
											approvingSession={approvingSession}
											approveSession={approveSession}
											rejectSession={rejectSession}
											deleteSession={deleteSession}
											handleSessions={handleSessions}
											showActions={true}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);

};

// ✅ Updated SessionCard with showActions prop
interface SessionCardProps {
  session: Session;
  approvingSession: string | null;
  approveSession: (id: string) => Promise<void>;
  rejectSession: (id: string) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  handleSessions: (session: Session) => void;
  showActions: boolean;
}

const SessionCard: React.FC<SessionCardProps> = ({
	session,
	approvingSession,
	approveSession,
	rejectSession,
	deleteSession,
	handleSessions,
	showActions,
}) => (
	<Card
		className="bg-white/[0.02] border-white/[0.08] backdrop-blur-md shadow-xl rounded-3xl p-6 hover:bg-white/[0.04] transition-all cursor-pointer group relative overflow-hidden ring-1 ring-white/5"
		onClick={() => handleSessions(session)}
	>
		<div className="flex flex-col gap-6">
			{/* Top Info: Learner and Skill */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
						<User className="w-6 h-6 text-primary" />
					</div>
					<div>
						<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Learner</p>
						<p className="text-lg font-black text-white group-hover:text-primary transition-colors">{session.learner.name}</p>
					</div>
				</div>
				<Badge 
					className={
						session.status === "CONFIRMED"
							? "bg-primary/10 text-primary border-primary/20 text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest"
							: session.status === "PENDING"
							? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest"
							: "bg-red-500/10 text-red-500 border-red-500/20 text-[10px] py-1 px-3 rounded-full font-black uppercase tracking-widest"
					}
				>
					{session.status}
				</Badge>
			</div>

			<Separator className="bg-white/5" />

			{/* Details Section */}
			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-slate-500">
						<Award className="w-3 h-3 text-accent" />
						<span className="text-[10px] font-black uppercase tracking-widest">Skill Focus</span>
					</div>
					<p className="text-sm font-bold text-white truncate">{session.skill.name}</p>
				</div>
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-slate-500">
						<Clock className="w-3 h-3 text-primary" />
						<span className="text-[10px] font-black uppercase tracking-widest">Scheduled For</span>
					</div>
					<p className="text-sm font-bold text-white uppercase" suppressHydrationWarning>
						{new Date(session.scheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
					</p>
				</div>
			</div>

			{/* Bottom Bar: Actions or Meet Link */}
			<div className="flex items-center justify-between pt-2">
				<div className="flex-1">
					{session.status === "CONFIRMED" && session.meetLink && (
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20">
							<CheckCircle2 className="w-3.5 h-3.5 text-primary" />
							<span className="text-[11px] font-bold text-primary uppercase">Meet Ready</span>
						</div>
					)}
				</div>

				<div className="flex items-center gap-2">
					{showActions && session.status === "PENDING" && (
						<>
							<Button
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									approveSession(session.id);
								}}
								className="bg-primary hover:bg-primary/90 text-white font-black text-xs h-9 px-4 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105"
								disabled={approvingSession === session.id}
							>
								{approvingSession === session.id ? "Creating..." : "Approve"}
							</Button>
							<Button
								variant="ghost"
								onClick={(e) => {
									e.stopPropagation();
									e.preventDefault();
									rejectSession(session.id);
								}}
								className="text-red-500 hover:text-white hover:bg-red-500/10 font-black text-xs h-9 px-4 rounded-xl"
								disabled={approvingSession === session.id}
							>
								<XCircle className="w-4 h-4 mr-1" />
								Reject
							</Button>
						</>
					)}
					<Button
						variant="ghost"
						onClick={(e) => {
							e.stopPropagation();
							e.preventDefault();
							deleteSession(session.id);
						}}
						className="h-9 w-9 p-0 rounded-xl bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-500 transition-all border border-white/5"
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	</Card>
);

export default SessionsPage;
