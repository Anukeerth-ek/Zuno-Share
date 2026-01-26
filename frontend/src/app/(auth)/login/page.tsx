"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Mail, Lock, User, Sparkles, ArrowRight, Github } from "lucide-react";
import { getBaseUrl } from "@/utils/getBaseUrl";
import { useRouter } from "next/navigation";

interface FormData {
     email: string;
     password: string;
     confirmPassword?: string;
     name?: string;
}

interface FormErrors {
     email?: string;
     password?: string;
     confirmPassword?: string;
     name?: string;
     general?: string;
}

export default function Page() {
     const router = useRouter();
     const [isLogin, setIsLogin] = useState(true);
     const [showPassword, setShowPassword] = useState(false);
     const [showConfirmPassword, setShowConfirmPassword] = useState(false);
     const [isLoading, setIsLoading] = useState(false);
     const [formData, setFormData] = useState<FormData>({
          email: "",
          password: "",
          confirmPassword: "",
          name: "",
     });
     const [errors, setErrors] = useState<FormErrors>({});

     const validateForm = (): boolean => {
          const newErrors: FormErrors = {};

          if (!formData.email) {
               newErrors.email = "Email is required";
          } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
               newErrors.email = "Please enter a valid email address";
          }

          if (!formData.password) {
               newErrors.password = "Password is required";
          } else if (formData.password.length < 6) {
               newErrors.password = "Password must be at least 6 characters long";
          }

          if (!isLogin) {
               if (!formData.name) {
                    newErrors.name = "Name is required";
               }
               if (!formData.confirmPassword) {
                    newErrors.confirmPassword = "Please confirm your password";
               } else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = "Passwords do not match";
               }
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
     };

     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          setFormData((prev) => ({ ...prev, [name]: value }));
          if (errors[name as keyof FormErrors]) {
               setErrors((prev) => ({ ...prev, [name]: undefined }));
          }
     };

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          if (!validateForm()) return;

          setIsLoading(true);
          setErrors({});

          try {
               const BASE_URL = getBaseUrl();
               if (isLogin) {
                    const res = await fetch(`${BASE_URL}/api/auth/login`, {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                              email: formData.email,
                              password: formData.password,
                         }),
                    });

                    const data = await res.json();
                    if (!res.ok) {
                         setErrors({ general: data.message || "Login failed" });
                         setIsLoading(false);
                         return;
                    }

                    localStorage.setItem("token", data.token);
                    window.dispatchEvent(new Event("userLoggedIn"));

                    const profileRes = await fetch(`${BASE_URL}/api/profile/me`, {
                         method: "GET",
                         headers: { Authorization: `Bearer ${data.token}` },
                    });

                    router.push("/");
               } else {
                    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
                         method: "POST",
                         headers: { "Content-Type": "application/json" },
                         body: JSON.stringify({
                              email: formData.email,
                              password: formData.password,
                              name: formData.name,
                         }),
                    });

                    const data = await res.json();
                    if (!res.ok) {
                         setErrors({ general: data.message || "Signup failed" });
                         setIsLoading(false);
                         return;
                    }

                    setIsLogin(true);
               }
          } catch (error) {
               console.error("Login/signup error:", error);
               setErrors({ general: "An error occurred. Please try again." });
          } finally {
               setIsLoading(false);
          }
     };

     const toggleMode = () => {
          setIsLogin(!isLogin);
          setFormData({
               email: "",
               password: "",
               confirmPassword: "",
               name: "",
          });
          setErrors({});
     };

     return (
          <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0c10]">
               {/* Background Elements */}
               <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-blob" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] animate-blob animation-delay-2000" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[150px] animate-blob animation-delay-4000" />
               </div>

               {/* Grid Pattern */}
               <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
                    style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
               />

               <div className="w-full max-w-md z-10 px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center mb-8">
                         <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
                              <Sparkles className="h-8 w-8 text-primary shadow-sm" />
                         </div>
                         <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50">
                              Zuno
                         </h1>
                         <p className="text-muted-foreground text-sm font-medium">
                              {isLogin ? "Welcome back! Please enter your details." : "Join our community of mentors and learners."}
                         </p>
                    </div>

                    <Card className="bg-white/[0.03] backdrop-blur-xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] overflow-hidden">
                         <CardHeader className="pb-2">
                              <CardTitle className="text-xl font-semibold text-white">
                                   {isLogin ? "Sign In" : "Create Account"}
                              </CardTitle>
                              <CardDescription className="text-white/50">
                                   {isLogin ? "Enter your email to access your account" : "Start your journey today"}
                              </CardDescription>
                         </CardHeader>

                         <form onSubmit={handleSubmit}>
                              <CardContent className="space-y-4 pt-4">
                                   {errors.general && (
                                        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive">
                                             <AlertDescription>{errors.general}</AlertDescription>
                                        </Alert>
                                   )}

                                   {!isLogin && (
                                        <div className="space-y-1.5">
                                             <Label htmlFor="name" className="text-white/70 text-xs font-semibold uppercase tracking-wider">Full Name</Label>
                                             <div className="relative group">
                                                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                                                  <Input
                                                       id="name"
                                                       name="name"
                                                       type="text"
                                                       placeholder="John Doe"
                                                       value={formData.name}
                                                       onChange={handleInputChange}
                                                       className={`pl-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:ring-primary/30 focus:border-primary/50 transition-all ${errors.name ? "border-red-500/50" : ""}`}
                                                  />
                                             </div>
                                             {errors.name && <p className="text-[10px] text-red-500 font-medium">{errors.name}</p>}
                                        </div>
                                   )}

                                   <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-white/70 text-xs font-semibold uppercase tracking-wider">Email Address</Label>
                                        <div className="relative group">
                                             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                                             <Input
                                                  id="email"
                                                  name="email"
                                                  type="email"
                                                  placeholder="name@example.com"
                                                  value={formData.email}
                                                  onChange={handleInputChange}
                                                  className={`pl-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:ring-primary/30 focus:border-primary/50 transition-all ${errors.email ? "border-red-500/50" : ""}`}
                                             />
                                        </div>
                                        {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
                                   </div>

                                   <div className="space-y-1.5">
                                        <div className="flex items-center justify-between">
                                             <Label htmlFor="password" className="text-white/70 text-xs font-semibold uppercase tracking-wider">Password</Label>
                                             {isLogin && (
                                                  <button type="button" className="text-[11px] text-primary/80 hover:text-primary transition-colors">
                                                       Forgot?
                                                  </button>
                                             )}
                                        </div>
                                        <div className="relative group">
                                             <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                                             <Input
                                                  id="password"
                                                  name="password"
                                                  type={showPassword ? "text" : "password"}
                                                  placeholder="••••••••"
                                                  value={formData.password}
                                                  onChange={handleInputChange}
                                                  className={`pl-10 pr-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:ring-primary/30 focus:border-primary/50 transition-all ${errors.password ? "border-red-500/50" : ""}`}
                                             />
                                             <button
                                                  type="button"
                                                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 hover:text-white/60 transition-colors"
                                                  onClick={() => setShowPassword(!showPassword)}
                                             >
                                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                             </button>
                                        </div>
                                        {errors.password && <p className="text-[10px] text-red-500 font-medium">{errors.password}</p>}
                                   </div>

                                   {!isLogin && (
                                        <div className="space-y-1.5">
                                             <Label htmlFor="confirmPassword" className="text-white/70 text-xs font-semibold uppercase tracking-wider">Confirm Password</Label>
                                             <div className="relative group">
                                                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-primary transition-colors" />
                                                  <Input
                                                       id="confirmPassword"
                                                       name="confirmPassword"
                                                       type={showConfirmPassword ? "text" : "password"}
                                                       placeholder="••••••••"
                                                       value={formData.confirmPassword}
                                                       onChange={handleInputChange}
                                                       className={`pl-10 pr-10 h-11 bg-white/[0.05] border-white/10 text-white placeholder:text-white/20 focus:ring-primary/30 focus:border-primary/50 transition-all ${errors.confirmPassword ? "border-red-500/50" : ""}`}
                                                  />
                                                  <button
                                                       type="button"
                                                       className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 hover:text-white/60 transition-colors"
                                                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                  >
                                                       {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                  </button>
                                             </div>
                                             {errors.confirmPassword && <p className="text-[10px] text-red-500 font-medium">{errors.confirmPassword}</p>}
                                        </div>
                                   )}
                              </CardContent>

                              <CardFooter className="flex flex-col space-y-4 pt-4">
                                   <Button 
                                        type="submit" 
                                        className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_20px_-5px_hsl(var(--primary))] transition-all active:scale-[0.98]" 
                                        disabled={isLoading}
                                   >
                                        {isLoading ? (
                                             <div className="flex items-center gap-2">
                                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                                  <span>Processing...</span>
                                             </div>
                                        ) : (
                                             <div className="flex items-center gap-2">
                                                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                                                  <ArrowRight className="h-4 w-4" />
                                             </div>
                                        )}
                                   </Button>

                                   <div className="flex items-center gap-4 w-full">
                                        <div className="h-px bg-white/10 flex-1"></div>
                                        <span className="text-[10px] text-white/20 font-bold tracking-widest uppercase">Or</span>
                                        <div className="h-px bg-white/10 flex-1"></div>
                                   </div>

                                   <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full h-11 border-white/10 bg-white/[0.02] text-white hover:bg-white/[0.05] hover:text-white transition-all active:scale-[0.98]"
                                   >
                                        <Github className="mr-2 h-4 w-4" />
                                        Continue with GitHub
                                   </Button>

                                   <div className="text-center text-sm">
                                        <span className="text-white/40">
                                             {isLogin ? "Don't have an account?" : "Already have an account?"}
                                        </span>{" "}
                                        <button
                                             type="button"
                                             onClick={toggleMode}
                                             className="text-primary font-bold hover:underline underline-offset-4 transition-all"
                                        >
                                             {isLogin ? "Join Now" : "Sign In"}
                                        </button>
                                   </div>
                              </CardFooter>
                         </form>
                    </Card>
                    
                    <p className="mt-8 text-center text-[11px] text-white/20 font-medium">
                         By continuing, you agree to our <span className="underline cursor-pointer">Terms</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
                    </p>
               </div>
          </div>
     );
}
