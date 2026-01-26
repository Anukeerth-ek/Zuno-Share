"use client";

import React from "react";
import { Home, BookOpen, Users, MessageCircle, Bell, LogOut, Settings, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetMyProfile } from "@/app/hooks/useGetMyProfile";
import Link from "next/link";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";

export const Navbar = () => {
	const { user, loading } = useGetMyProfile();

	const displayName = loading ? "Loading..." : user?.name || "Guest";
	const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "G";
	const avatarUrl = user?.avatarUrl || "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png";

	const pathname = usePathname();

	const isActive = (path: string) => pathname === path;
	return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-xl text-primary-foreground shadow-lg shadow-primary/20">
							L
						</div>
						<span className="text-xl font-bold tracking-tight text-white">Zuno</span>
					</div>

					{/* Desktop Navigation */}
					<div className="flex items-center space-x-2">
						<Link href="/">
							<Button
								variant="ghost"
								size="sm"
								className={
									isActive("/")
										? "text-primary hover:text-primary hover:bg-primary/10 cursor-pointer font-medium"
										: "text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
								}
							>
								<Home className="w-4 h-4 mr-2" />
								Home
							</Button>
						</Link>
						<Link href="/frontend/connections">
							<Button
								variant="ghost"
								size="sm"
								className={
									isActive("/frontend/connections")
										? "text-primary hover:text-primary hover:bg-primary/10 cursor-pointer font-medium"
										: "text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
								}
							>
								<Users className="w-4 h-4 mr-2" />
								My Connections
							</Button>
						</Link>
						<Link href="/frontend/sessions">
							<Button
								variant="ghost"
								size="sm"
								className={
									isActive("/frontend/sessions")
										? "text-primary hover:text-primary hover:bg-primary/10 cursor-pointer font-medium"
										: "text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
								}
							>
								<BookOpen className="w-4 h-4 mr-2" />
								My Sessions
							</Button>
						</Link>
						<Link href="/frontend/chat">
							<Button
								variant="ghost"
								size="sm"
								className={
									isActive("/frontend/chat")
										? "text-primary hover:text-primary hover:bg-primary/10 cursor-pointer font-medium"
										: "text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
								}
							>
								<MessageCircle className="w-4 h-4 mr-2" />
								Messages
							</Button>
						</Link>
					</div>

					<div className="flex items-center space-x-4">
						{loading ? (
							<div className="w-8 h-8 rounded-full bg-border/50 animate-pulse" />
						) : user ? (
							<div className="flex items-center gap-4">
								<Button
									variant="ghost"
									size="icon"
									className="text-gray-400 hover:text-white hover:bg-white/5 rounded-full"
								>
									<Bell className="w-5 h-5" />
								</Button>

								{/* Dropdown Profile Section */}
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-border/50 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all cursor-pointer group">
											<span className="text-sm font-medium text-gray-200 pl-2 hidden md:inline">
												{displayName}
											</span>
											<Avatar className="w-8 h-8 border-2 border-primary/20 group-hover:border-primary transition-colors">
												<AvatarImage src={avatarUrl} />
												<AvatarFallback>{avatarLetter}</AvatarFallback>
											</Avatar>
											<ChevronDown className="w-4 h-4 text-gray-500 mr-2 group-hover:text-primary transition-colors" />
										</div>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56 mt-2 p-2">
										<div className="px-2 py-2 mb-2">
											<p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
												Account
											</p>
											<p className="text-sm font-medium text-white truncate">{user.email}</p>
										</div>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild className="cursor-pointer py-2">
											<Link href="/profile" className="flex items-center w-full">
												<Settings className="w-4 h-4 mr-2 text-primary" />
												Edit Profile
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer py-2"
											onClick={() => {
												localStorage.removeItem("token");
												window.location.href = "/login";
											}}
										>
											<LogOut className="w-4 h-4 mr-2" />
											Logout
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						) : (
							<Link href="/login">
								<Button className="relative overflow-hidden group bg-gradient-to-br from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold px-6 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/20">
									<span className="relative z-10">Login</span>
									<div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
