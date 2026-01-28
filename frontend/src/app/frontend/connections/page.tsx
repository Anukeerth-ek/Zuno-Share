"use client";

import { useState, useEffect } from "react";
import { MoreHorizontal, Users, Mail, MapPin, Briefcase, Plus, CheckCircle2, XCircle, Bell, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGetMyProfile } from "@/app/hooks/useGetMyProfile";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useGetUserConnections } from "@/app/hooks/useGetUserConnection";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
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

interface IncomingRequest {
	id: string;
	sender: {
		id: string;
		name: string;
		avatarUrl?: string;
	};
}

export default function ConnectionListPage() {
	const { user: currentUser } = useGetMyProfile();
	const router = useRouter();
	const { usersConnection, setUsersConnection, loading, error } = useGetUserConnections(currentUser?.id);

	const [showPopover, setShowPopover] = useState(false);
	const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
	const [loadingRequests, setLoadingRequests] = useState(false);

	useEffect(() => {
		if (!currentUser?.id) return;
		const fetchIncoming = async () => {
			try {
				const BASE_URL = getBaseUrl();
				const res = await fetch(`${BASE_URL}/api/connections/requests/incoming/${currentUser?.id}`);
				const data = await res.json();
				if (res.ok) setIncomingRequests(data || []);
			} catch {
				// No action needed
			}
		};
		fetchIncoming();
	}, [currentUser?.id]);

	const fetchIncomingRequests = async () => {
		if (!currentUser?.id) return;
		setLoadingRequests(true);
		try {
			const BASE_URL = getBaseUrl();
			const res = await fetch(`${BASE_URL}/api/connections/requests/incoming/${currentUser.id}`);
			const data = await res.json();
			setIncomingRequests(data || []);
		} catch {
			toast.error("Failed to load connection requests");
		} finally {
			setLoadingRequests(false);
		}
	};

	const handleAccept = async (connectionId: string) => {
		try {
			const BASE_URL = getBaseUrl();
			const res = await fetch(`${BASE_URL}/api/connections/accept`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ connectionId }),
			});
			if (res.ok) {
				toast.success("Connection accepted");
				setIncomingRequests((prev) => prev.filter((c) => c.id !== connectionId));
				const updated = await fetch(`${BASE_URL}/api/connections/${currentUser?.id}`);
				const data = await updated.json();
				setUsersConnection?.(data);
			}
		} catch {
			toast.error("Something went wrong");
		}
	};

	const handleDecline = async (connectionId: string) => {
		try {
			const BASE_URL = getBaseUrl();
			const res = await fetch(`${BASE_URL}/api/connections/decline`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ connectionId }),
			});
			if (res.ok) {
				toast.info("Connection declined");
				setIncomingRequests((prev) => prev.filter((c) => c.id !== connectionId));
			}
		} catch {
			toast.error("Something went wrong");
		}
	};

	if (loading) return (
		<div className="min-h-screen bg-[#030712] flex items-center justify-center">
			<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
		</div>
	);

	if (error) return (
		<div className="min-h-screen bg-[#030712] flex items-center justify-center text-white">
			<p>Failed to fetch connections. Please try again later.</p>
		</div>
	);

	return (
		<div className="min-h-screen bg-[#030712] relative isolate overflow-hidden pt-24 pb-12 px-6 lg:px-12 mt-10">
			<div className="absolute inset-0 -z-10 h-full w-full bg-[#030712]">
				<div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl pointer-events-none" aria-hidden="true">
					<div className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-primary/20 to-[#2563eb]/20 opacity-10" style={{ clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)' }} />
				</div>
			</div>

			<div className="max-w-7xl mx-auto space-y-10">
				<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
					<div className="space-y-2">
						<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
							<Users className="w-3 h-3" />
							Networking
						</div>
						<h1 className="text-4xl font-black text-white tracking-tight">
							My <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ecosystem</span>
						</h1>
						<p className="text-slate-500 max-w-lg">Manage your active connections and knowledge-sharing partnerships in one central hub.</p>
					</div>

					<div className="flex items-center gap-3">
						<Popover open={showPopover} onOpenChange={(open) => { setShowPopover(open); if (open) fetchIncomingRequests(); }}>
							<PopoverTrigger asChild>
								<Button className="bg-white/5 hover:bg-white/10 border-white/10 text-white gap-2 h-12 px-6 rounded-2xl relative transition-all group overflow-hidden">
									<div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
									<Bell className="w-5 h-5 text-primary" />
									<span className="font-bold">Invitations</span>
									{incomingRequests.length > 0 && (
										<span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white ring-2 ring-[#030712]">
											{incomingRequests.length}
										</span>
									)}
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-96 p-0 bg-slate-900/90 backdrop-blur-2xl border-white/10 shadow-2xl overflow-hidden rounded-3xl" align="end">
								<div className="p-5 border-b border-white/5 bg-white/5">
									<h4 className="font-black text-white text-sm uppercase tracking-widest flex items-center gap-2">
										<Plus className="w-4 h-4 text-primary" />
										Connection Requests
									</h4>
								</div>
								<div className="max-h-[400px] overflow-y-auto">
									{loadingRequests ? (
										<div className="p-8 text-center"><div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" /></div>
									) : incomingRequests.length === 0 ? (
										<div className="p-10 text-center space-y-3">
											<Users className="w-10 h-10 text-slate-700 mx-auto" />
											<p className="text-sm text-slate-500">Your inbox is clear! No pending requests.</p>
										</div>
									) : (
										<div className="divide-y divide-white/5">
											{incomingRequests.map((conn) => (
												<div key={conn.id} className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
													<Avatar className="h-10 w-10 border border-white/10">
														<AvatarImage src={conn.sender.avatarUrl} />
														<AvatarFallback><UserIcon className="w-5 h-5 text-slate-600" /></AvatarFallback>
													</Avatar>
													<div className="flex-1 min-w-0">
														<p className="text-sm font-bold text-white truncate">{conn.sender.name}</p>
														<p className="text-xs text-slate-500">Wants to connect</p>
													</div>
													<div className="flex gap-2">
														<Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white" onClick={() => handleAccept(conn.id)}>
															<CheckCircle2 className="w-4 h-4" />
														</Button>
														<Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white" onClick={() => handleDecline(conn.id)}>
															<XCircle className="w-4 h-4" />
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</div>

				{/* Table Container */}
				<Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/5 will-change-transform">
					<div className="overflow-x-auto">
						<table className="w-full border-collapse">
							<thead>
								<tr className="bg-white/[0.03] border-b border-white/[0.05]">
									<th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Partner</th>
									<th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Specialization</th>
									<th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Knowledge to Gain</th>
									<th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contact</th>
									<th className="w-20 py-5"></th>
								</tr>
							</thead>
							<tbody className="divide-y divide-white/[0.05]">
								{usersConnection && usersConnection.length > 0 ? (
									usersConnection.map((connection: UserConnection) => (
										<tr 
											key={connection.id}
											onClick={() => router.push(`/frontend/connections/${connection.user.id}`)}
											className="group hover:bg-white/[0.03] transition-all cursor-pointer"
										>
											<td className="px-8 py-6 whitespace-nowrap">
												<div className="flex items-center gap-4">
													<Avatar className="h-12 w-12 rounded-2xl border-2 border-slate-900 ring-1 ring-white/10 group-hover:ring-primary/50 transition-all shadow-lg overflow-hidden">
														<AvatarImage src={connection.avatar} className="object-cover" />
														<AvatarFallback className="bg-slate-800 text-slate-400 font-bold">{connection.user.name[0]}</AvatarFallback>
													</Avatar>
													<div className="space-y-0.5">
														<div className="text-base font-black text-white group-hover:text-primary transition-colors uppercase">{connection.user.name}</div>
														<div className="text-xs text-slate-500 flex items-center gap-1">
															<Briefcase className="w-3 h-3" />
															{connection.jobTitle || "Knowledge Seeker"}
														</div>
													</div>
												</div>
											</td>
											<td className="px-8 py-6 whitespace-nowrap">
												<div className="flex flex-wrap gap-1.5 max-w-[200px]">
													{connection.user.skillsOffered?.slice(0, 2).map((skill) => (
														<Badge key={skill.name} className="bg-primary/10 text-primary border-primary/20 text-[10px] py-1 px-2 rounded-lg font-bold">
															{skill.name}
														</Badge>
													)) || <span className="text-slate-600 text-xs italic">No skills listed</span>}
												</div>
											</td>
											<td className="px-8 py-6 whitespace-nowrap text-slate-400 text-sm">
												<div className="flex flex-wrap gap-1.5 max-w-[200px]">
													{connection.user.skillsWanted?.slice(0, 2).map((skill) => (
														<Badge key={skill.name} className="bg-accent/10 text-accent border-accent/20 text-[10px] py-1 px-2 rounded-lg font-bold">
															{skill.name}
														</Badge>
													)) || <span className="text-slate-600 text-xs italic">Open to anything</span>}
												</div>
											</td>
											<td className="px-8 py-6 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-xs text-slate-300 flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-primary" />
                                                        {connection.email || "Private Email"}
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-2">
                                                        <MapPin className="w-3 h-3 text-accent" />
                                                        {connection.department || "Global"}
                                                    </div>
                                                </div>
											</td>
											<td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-white/10 text-slate-500 hover:text-white transition-all">
															<MoreHorizontal className="h-5 w-5" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white rounded-2xl p-1 shadow-2xl">
														<DropdownMenuItem className="rounded-xl focus:bg-primary focus:text-white cursor-pointer" onClick={() => router.push(`/frontend/connections/${connection.user.id}`)}>
															View Profile
														</DropdownMenuItem>
														<DropdownMenuItem className="rounded-xl focus:bg-primary focus:text-white cursor-pointer">
															Send Message
														</DropdownMenuItem>
														<Separator className="my-1 bg-white/5" />
														<DropdownMenuItem className="rounded-xl focus:bg-red-500 focus:text-white text-red-500 cursor-pointer">
															Archive Partner
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={5} className="py-24 text-center">
											<div className="flex flex-col items-center space-y-4">
												<Users className="w-16 h-16 text-slate-800" />
												<div className="space-y-1">
													<p className="text-xl font-black text-slate-500">No active knowledge partners</p>
													<p className="text-sm text-slate-600">Start exploring the community to build your ecosystem.</p>
												</div>
												<Button onClick={() => router.push("/")} className="mt-4 bg-primary text-white font-bold h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
													Explore Community
												</Button>
											</div>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</Card>
			</div>
		</div>
	);
}
