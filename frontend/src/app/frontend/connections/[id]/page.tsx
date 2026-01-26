"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
	AlertCircle, 
	Award, 
	Briefcase, 
	Calendar, 
	CheckCircle2, 
	Clock, 
	MapPin, 
	ChevronLeft, 
	Zap,
	ShieldCheck,
	Sparkles,
	Save
} from "lucide-react";
import { User } from "@/types";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ConnectionDetailPage() {
	const { id } = useParams();
	const router = useRouter();
	const [mentor, setMentor] = useState<User | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [selectedSkillNames, setSelectedSkillNames] = useState<string | null>(null);
	const [requestLoading, setRequestLoading] = useState(false);
	const [requestStatus, setRequestStatus] = useState(false);
	const [errors, setErrors] = useState({ date: false, skill: false });
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		if (!id) return;
		const fetchData = async () => {
			try {
				const BASE_URL = getBaseUrl();
				const res = await fetch(`${BASE_URL}/api/profile/user/${id}`);
				const data = await res.json();
				setMentor(data.user);
			} catch (err) {
				console.error("Failed to fetch user", err);
			}
		};
		fetchData();
	}, [id]);

	const handleSubmitRequest = async () => {
		const newErrors = {
			date: !selectedDate,
			skill: !selectedSkillNames,
		};
		setErrors(newErrors);
		if (newErrors.date || newErrors.skill) return;

		setRequestLoading(true);
		try {
			const token = localStorage.getItem("token");
			const BASE_URL = getBaseUrl();
			const res = await fetch(`${BASE_URL}/api/sessions/request`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					startTime: selectedDate?.toISOString(),
					mentorId: mentor?.id,
					selectedSkillNames: selectedSkillNames,
				}),
			});

			if (res.ok) {
				setRequestStatus(true);
				setShowSuccess(true);
				setTimeout(() => setShowSuccess(false), 4000);
			} else {
				alert("Failed to request session");
			}
		} catch (error) {
			console.error("error: ", error);
		} finally {
			setRequestLoading(false);
		}
	};

	if (!mentor) return (
		<div className="min-h-screen bg-[#030712] flex items-center justify-center">
			<div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
		</div>
	);

	return (
		<div className="min-h-screen bg-[#030712] relative isolate overflow-hidden pt-24 pb-12 px-6 lg:px-12 mt-10">
			{/* Aesthetic Background */}
			<div className="absolute inset-0 -z-10 h-full w-full bg-[#030712]">
				<div className="absolute inset-x-0 top-0 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl pointer-events-none" aria-hidden="true">
					<div className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-primary/10 to-[#2563eb]/10 opacity-10" style={{ clipPath: 'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)' }} />
				</div>
			</div>

			<div className="max-w-5xl mx-auto space-y-8">
				{/* Back Navigation */}
				<Button 
					variant="ghost" 
					onClick={() => router.back()}
					className="text-slate-400 hover:text-white hover:bg-white/5 gap-2 -ml-2"
				>
					<ChevronLeft className="w-4 h-4" />
					Back to Connections
				</Button>

				{/* Success Message */}
				{showSuccess && (
					<div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
						<CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
						<p className="text-primary font-bold">Partnership session request submitted successfully! Your partner will be notified.</p>
					</div>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column: Profile Card */}
					<div className="lg:col-span-2 space-y-8">
						<Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden ring-1 ring-white/5 will-change-transform">
							<div className="h-32 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-white/5" />
							<CardContent className="relative -mt-16 pt-0 space-y-8">
								<div className="flex flex-col md:flex-row items-center md:items-end gap-6">
									<Avatar className="w-32 h-32 rounded-3xl border-4 border-[#030712] shadow-2xl ring-1 ring-white/10">
										<AvatarImage src={mentor.avatarUrl || ""} className="object-cover" />
										<AvatarFallback className="text-3xl bg-slate-800 text-slate-400 font-bold uppercase">
											{mentor.name?.charAt(0)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 text-center md:text-left pb-2">
										<h1 className="text-4xl font-black text-white tracking-tight uppercase">{mentor.name}</h1>
										<div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
											<div className="flex items-center gap-1.5 text-primary text-sm font-bold">
												<Briefcase className="w-4 h-4" />
												{mentor.professionDetails?.title || "Knowledge Specialist"}
											</div>
											<div className="flex items-center gap-1.5 text-slate-500 text-sm">
												<Award className="w-4 h-4" />
												{mentor?.experienceSummary?.years || "0"}y Experience
											</div>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
										<Clock className="w-5 h-5 text-primary shrink-0" />
										<div>
											<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Timezone</p>
											<p className="text-sm font-bold text-white">{mentor.timeZone || "Global"}</p>
										</div>
									</div>
									<div className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
										<MapPin className="w-5 h-5 text-accent shrink-0" />
										<div>
											<p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organization</p>
											<p className="text-sm font-bold text-white truncate max-w-[150px]">
												{mentor?.currentOrganization?.organization || "Independent"}
											</p>
										</div>
									</div>
								</div>

								<Separator className="bg-white/5" />

								<div className="space-y-4">
									<h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
										<ShieldCheck className="w-4 h-4 text-primary" />
										About Your Partner
									</h2>
									<p className="text-slate-400 leading-relaxed italic border-l-2 border-primary/20 pl-4">
										{mentor?.bio || "No biography available for this partner."}
									</p>
								</div>

								<Separator className="bg-white/5" />

								<div className="space-y-6">
									{mentor.skillsOffered?.length > 0 && (
										<div className="space-y-3">
											<h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mastery To Offer</h2>
											<div className="flex flex-wrap gap-2">
												{mentor.skillsOffered.map((skill, index) => (
													<Badge key={index} className="bg-primary/10 text-primary border-primary/20 py-2 px-4 rounded-xl text-xs font-bold">
														{skill.name}
													</Badge>
												))}
											</div>
										</div>
									)}

									{mentor.skillsWanted?.length > 0 && (
										<div className="space-y-3">
											<h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Knowledge Desired</h2>
											<div className="flex flex-wrap gap-2">
												{mentor.skillsWanted.map((skill, index) => (
													<Badge key={index} className="bg-accent/10 text-accent border-accent/20 py-2 px-4 rounded-xl text-xs font-bold">
														{skill.name}
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right Column: Interaction Hub */}
					<div className="space-y-8">
						<Card className="bg-white/[0.02] border-white/[0.08] backdrop-blur-xl shadow-2xl rounded-3xl ring-1 ring-white/5 overflow-hidden">
							<CardHeader className="bg-white/[0.03] border-b border-white/[0.05]">
								<CardTitle className="text-lg font-black text-white flex items-center gap-2 uppercase tracking-tight">
									<Zap className="w-5 h-5 text-primary" />
									Knowledge Exchange
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-6">
								{mentor.skillsOffered?.length > 0 && (
									<div className="space-y-3">
										<label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mastery To Learn *</label>
										<Select onValueChange={(val) => {
											setSelectedSkillNames(val);
											setErrors(p => ({ ...p, skill: false }));
										}}>
											<SelectTrigger className="bg-slate-950/40 border-white/10 text-white h-12 rounded-xl focus:ring-primary/50">
												<SelectValue placeholder="Select a skill" />
											</SelectTrigger>
											<SelectContent className="bg-slate-900 border-white/10 text-white">
												{mentor.skillsOffered.map(skill => (
													<SelectItem key={skill.id} value={skill.id}>{skill.name}</SelectItem>
												))}
											</SelectContent>
										</Select>
										{errors.skill && (
											<div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase bg-primary/5 p-2 rounded-lg">
												<AlertCircle className="w-3 h-3" />
												Choice Required
											</div>
										)}
									</div>
								)}

								<div className="space-y-3">
									<label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Target Schedule *</label>
									<div className="relative">
										<Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
										<input
											type="datetime-local"
											onChange={(e) => {
												setSelectedDate(e.target.value ? new Date(e.target.value) : null);
												setErrors(p => ({ ...p, date: false }));
											}}
											className={`w-full bg-slate-950/40 border ${errors.date ? "border-primary" : "border-white/10"} text-white pl-12 pr-4 h-12 rounded-xl focus:ring-primary/50 outline-none text-sm`}
										/>
									</div>
									{errors.date && (
										<div className="flex items-center gap-2 text-primary text-[10px] font-bold uppercase bg-primary/5 p-2 rounded-lg">
											<AlertCircle className="w-3 h-3" />
											Date Required
										</div>
									)}
								</div>

								<Button
									onClick={handleSubmitRequest}
									disabled={requestLoading || requestStatus}
									className={`w-full py-6 rounded-2xl font-black text-lg transition-all shadow-xl shadow-primary/20 ${
										requestStatus 
											? "bg-green-500 hover:bg-green-500 text-white" 
											: "bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white"
									}`}
								>
									{requestStatus ? (
										<span className="flex items-center gap-2">
											<CheckCircle2 className="w-6 h-6" />
											REQUEST SENT
										</span>
									) : requestLoading ? (
										"INITIATING..."
									) : (
										<div className="flex items-center gap-2">
											<Save className="w-5 h-5" />
											SUBMIT REQUEST
										</div>
									)}
								</Button>
							</CardContent>
						</Card>

						{/* Consistency Note */}
						<div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-white/5 space-y-3">
							<Sparkles className="w-6 h-6 text-primary" />
							<h4 className="text-white font-black text-xs uppercase tracking-widest">Partner Reliability</h4>
							<p className="text-slate-500 text-xs leading-relaxed">
								Partners with detailed profiles are 3x more likely to accept mentorship requests within 24 hours.
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
